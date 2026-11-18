import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/shared/logo";
import { Copyright } from "@/components/shared/copyright";
import {
  FacebookIcon,
  GithubIcon,
  LinkedinIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/shared/social-icons";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tuitions", label: "Browse Tuitions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/sign-in", label: "Sign In" },
] as const;

const CONTACTS = [
  { icon: Mail, label: "support@mentorlagbe.com", href: "mailto:support@mentorlagbe.com" },
  { icon: Phone, label: "+880 1712 345678", href: "tel:+8801712345678" },
  { icon: MapPin, label: "Dhaka, Bangladesh", href: undefined },
] as const;

// TODO(content): replace href "#" with MentorLagbe's real social profiles.
const SOCIAL_LINKS = [
  { label: "X (formerly Twitter)", Icon: XIcon, href: "#" },
  { label: "Facebook", Icon: FacebookIcon, href: "#" },
  { label: "LinkedIn", Icon: LinkedinIcon, href: "#" },
  { label: "YouTube", Icon: YoutubeIcon, href: "#" },
  { label: "GitHub", Icon: GithubIcon, href: "#" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Learn better. Grow smarter. MentorLagbe connects students with verified tutors
              for online and home tuition across Bangladesh.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Contact</h3>
            <ul className="space-y-2.5">
              {CONTACTS.map((contact) => {
                const content = (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-primary">
                    <contact.icon className="size-4 shrink-0 text-primary" aria-hidden />
                    {contact.label}
                  </span>
                );
                return (
                  <li key={contact.label} className="group">
                    {contact.href ? (
                      <Link href={contact.href} className="inline-block">
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Follow Us</h3>
            <div className="flex flex-wrap gap-2.5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-white"
                >
                  <social.Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <Copyright />
      </div>
    </footer>
  );
}
