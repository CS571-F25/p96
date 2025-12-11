import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

export default function AccountPage() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");

  // avatar upload
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setAuthUser(u || null);
      setAuthLoading(false);

      if (!u) return;

      // initial avatar preview
      if (u.photoURL) {
        setAvatarPreview(u.photoURL);
      }

      try {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setBirthday(data.birthday || "");
        } else if (u.displayName) {
          const [f, ...rest] = u.displayName.split(" ");
          setFirstName(f || "");
          setLastName(rest.join(" "));
        }
      } catch (err) {
        console.error(err);
        setError("Error loading your profile: " + err.message);
      }
    });

    return unsub;
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setSaved(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authUser) return;

    if (newPassword && newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const auth = getAuth();
      let photoURL = authUser.photoURL || null;

      // 1) upload avatar if a new file was selected
      if (avatarFile) {
        const avatarRef = ref(storage, `avatars/${authUser.uid}`);
        await uploadBytes(avatarRef, avatarFile);
        photoURL = await getDownloadURL(avatarRef);
      }

      const displayName = `${firstName} ${lastName}`.trim();

      // 2) update auth profile (name + photo)
      await updateProfile(auth.currentUser, {
        displayName: displayName || null,
        photoURL: photoURL || null,
      });

      // 3) update Firestore profile doc
      const userRef = doc(db, "users", authUser.uid);
      await setDoc(
        userRef,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          birthday: birthday || null,
          photoURL: photoURL || null,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 4) update password if provided
      if (newPassword) {
        try {
          await updatePassword(auth.currentUser, newPassword);
        } catch (err) {
          if (err.code === "auth/requires-recent-login") {
            throw new Error(
              "For security, please sign out and sign back in, then try updating your password again."
            );
          } else {
            throw new Error("Could not update password: " + err.message);
          }
        }
      }

      setSaved(true);
      // keep fields visible; don’t clear them
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <Container className="py-4">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!authUser) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          You need to sign in to manage your account.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="p-3">
        <h2 className="mb-3">Account</h2>
        <p className="text-muted">
          Your name and profile photo are visible in chat rooms. Your birthday
          stays private and is only used to unlock 21+ spaces.
        </p>

        {error && <Alert variant="danger">{error}</Alert>}
        {saved && <Alert variant="success">Profile saved.</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Avatar + basic info in a row on larger screens */}
          <Row className="mb-3">
            <Col xs="auto" className="mb-3">
              <div className="account-avatar-wrap">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile preview"
                    className="account-avatar-img"
                  />
                ) : (
                  <div className="account-avatar-fallback">
                    {firstName?.[0]?.toUpperCase() ||
                      authUser.email?.[0]?.toUpperCase() ||
                      "U"}
                  </div>
                )}
              </div>
              <Form.Group controlId="avatarUpload" className="mt-2">
                <Form.Label className="mb-1">Profile photo</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  size="sm"
                />
                <Form.Text muted>
                  Square images look best. Max a few MB.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col>
              <Form.Group className="mb-3" controlId="firstName">
                <Form.Label>First name</Form.Label>
                <Form.Control
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="lastName">
                <Form.Label>Last name</Form.Label>
                <Form.Control
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="birthday">
                <Form.Label>Birthday</Form.Label>
                <Form.Control
                  type="date"
                  value={birthday || ""}
                  onChange={(e) => setBirthday(e.target.value)}
                />
                <Form.Text muted>
                  Used only to check eligibility for 21+ chat rooms.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <hr />

          <h5 className="mt-2 mb-3">Change password</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="newPassword">
                <Form.Label>New password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  placeholder="Leave blank to keep your current password"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Confirm new password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}