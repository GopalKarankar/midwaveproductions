import { SiInstagram, SiYoutube, SiSpotify, SiFacebook, SiWhatsapp, SiX } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { MdMail } from "react-icons/md";

const ICONS = {
  email: MdMail,
  instagram: SiInstagram,
  youtube: SiYoutube,
  spotify: SiSpotify,
  linkedin: FaLinkedin,
  facebook: SiFacebook,
  whatsapp: SiWhatsapp,
  twitter: SiX,
};

export function SocialIcon({ platform, className = "w-4 h-4" }) {
  const Icon = ICONS[platform];
  if (!Icon) return null;
  return <Icon className={className} aria-hidden="true" />;
}
