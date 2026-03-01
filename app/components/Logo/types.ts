export interface LogoProps {
  collapsed?: boolean;
  className?: string; // Overall container
  logoClassName?: string; // The img
  textClassName?: string; // Front text "PANOPTICON" (if present, rendered below logo)
  backgroundClassName?: string; // Background text "PANOPTICON"
  showFrontText?: boolean; // Whether to show the bottom "PANOPTICON" text
}
