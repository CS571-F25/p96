import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function AccountPage() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load auth user + profile document
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setAuthUser(u || null);
      setAuthLoading(false);

      if (!u) {
        return;
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
      }
    });

    return unsub;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authUser) return;

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const auth = getAuth();
      const displayName = `${firstName} ${lastName}`.trim();

      if (displayName) {
        await updateProfile(auth.currentUser, { displayName });
      }

      const userRef = doc(db, "users", authUser.uid);
      await setDoc(
        userRef,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          birthday: birthday || null, // stored but never shown publicly
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSaved(true);
    } catch (err) {
      console.error(err);
      setError("Could not save your profile. Please try again.");
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
          Your name will be visible in chat rooms. Your birthday stays private
          and is only used to unlock 21+ spaces.
        </p>

        {error && <Alert variant="danger">{error}</Alert>}
        {saved && <Alert variant="success">Profile saved.</Alert>}

        <Form onSubmit={handleSubmit}>
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
              Used only to check eligibility for 21+ chat rooms. It’s not shown
              to other users.
            </Form.Text>
          </Form.Group>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}