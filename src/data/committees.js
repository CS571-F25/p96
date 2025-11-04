import vballLogo from "../assets/committees/volleyball.png";
import hockeyLogo from "../assets/committees/hockey.png";
import cwLogo from "../assets/committees/cardinal-white.png";
import footballLogo from "../assets/committees/football.png";
import basketballLogo from "../assets/committees/basketball.png";
import marketingLogo from "../assets/committees/marketing.png";
import dfeLogo from "../assets/committees/dfe.png";
import membershipLogo from "../assets/committees/membership.png";

export const COMMITTEES = [
  { slug: "football", name: "Football", icon: "F", subtitle: "Camp Randall Stadium",
    blurb: "Lead the student section and drive energy at every Badger football game.",
    logo: footballLogo, isSport: true },
  { slug: "madhouse", name: "Madhouse (Volleyball)", icon: "V", subtitle: "UW Field House",
    blurb: "Create the loudest volleyball atmosphere in the nation with coordinated chants and energy.",
    logo: vballLogo, isSport: true },
  { slug: "crease-creatures", name: "Crease Creatures (Hockey)", icon: "H", subtitle: "Kohl Center",
    blurb: "Bring the noise on the ice — hype up the crowd and support Badger hockey.",
    logo: hockeyLogo, isSport: true },
  { slug: "basketball", name: "Basketball", icon: "B", subtitle: "Kohl Center",
    blurb: "Support both men’s and women’s basketball through game-day engagement and section coordination.",
    logo: basketballLogo, isSport: true },
  { slug: "cardinal-white", name: "Cardinal & White", icon: "C", subtitle: "Olympic & Non-Revenue Sports",
    blurb: "Show up big for non-revenue sports — help promote events and build game-day presence.",
    logo: cwLogo, isSport: true },
  { slug: "dfe", name: "Diverse Fan Engagement", icon: "D", subtitle: "Campus & Community Outreach",
    blurb: "Build inclusive game-day experiences and connect with diverse campus groups.",
    logo: dfeLogo },
  { slug: "membership", name: "Membership", icon: "M", subtitle: "People & Culture",
    blurb: "Recruit, onboard, and retain members — plan socials and foster community within AreaRED.",
    logo: membershipLogo },
  { slug: "marketing", name: "Marketing", icon: "Mk", subtitle: "Brand & Media",
    blurb: "Create social media content, graphics, and campaigns to promote AreaRED events and identity.",
    logo: marketingLogo }
];