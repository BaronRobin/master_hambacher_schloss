# Hambacher Schloss Design Document

This document outlines the Corporate Identity (CI) and design principles for the Hambacher Schloss, based on the official website [hambacher-schloss.de](https://hambacher-schloss.de/).

## 1. Brand Essence
The design reflects the historical significance of Hambacher Schloss as the "Cradle of German Democracy." It combines a sense of historical authority with modern, clean layouts to promote accessibility and engagement.

---

## 2. Visual Identity

### Logo
![Stiftung Hambacher Schloss Logo](https://hambacher-schloss.de/wp-content/themes/HambacherSchloss/img/logos/StiftungHambacherSchloss-Logo-sRGB.svg)

- **Description:** A stacked serif typeface "STIFTUNG HAMBACHER SCHLOSS" with a dynamic, stylized swoosh of the German flag (Black, Red, Gold) above.
- **Symbolism:** Represents democracy, movement, and the German national identity rooted in the events of 1832.

### Color Palette

| Color | Hex | Role |
| :--- | :--- | :--- |
| **Brand Gold** | `#C69C79` | Primary accent, links, button borders, decorative icons. |
| **Dark Grey** | `#4A4A4A` | Primary text and headings. |
| **Deep Contrast** | `#222222` | Footer and high-contrast elements. |
| **Section Beige** | `#F0EEE6` | Soft background for content sections. |
| **White** | `#FFFFFF` | Main background and clean breaks. |
| **German Black** | `#000000` | Logo & specific accents. |
| **German Red** | `#E30613` | Logo accent. |
| **German Gold** | `#FFED00` | Logo accent. |

---

## 3. Typography

The typography uses a mix of serif and sans-serif fonts to balance tradition with modernity.

### Headings
- **Font:** `Vollkorn` (Serif)
- **Usage:** H1, H2, and major titles.
- **Weight:** Semi-bold (600).
- **Feel:** Authoritative, historical, grounded.

### Body & UI
- **Font:** `Outfit` (Sans-serif)
- **Usage:** Body text, navigation, buttons, and sub-headings.
- **Weights:** Light (300), Regular (400), Semi-bold (600).
- **Feel:** Modern, clean, highly readable.

### Promotional / Sliders
- **Font:** `Visby CF` (Sans-serif)
- **Usage:** Impactful text in sliders or featured sections.
- **Weights:** Regular (400), Bold (700).

---

## 4. Design Elements & Components

### Layout Principles
- **Spacing:** Generous whitespace (80px - 100px) between major sections.
- **Grid:** Clean, organized card layouts for news and events.
- **Corners:** **0px border-radius** (Sharp edges). This reinforces a formal and structured aesthetic.

### Buttons & Interaction
- **Style:** Outlined / Ghost buttons.
- **Border:** 1px solid `Brand Gold` (`#C69C79`).
- **Padding:** Wide padding (e.g., `10px 40px`).
- **Typography:** Often `Outfit` in uppercase.
- **Hover Effects:** Subtle transitions, often filling the background or shifting the border color.

### Imagery Style
- **Focus:** Architectural details, panoramic views of the castle, and people engaging in democratic activities.
- **Quality:** High-resolution, bright, and natural lighting.
- **Treatment:** Rectangular frames with sharp corners; no heavy gradients or overlays unless used for text readability.

---

## 5. UI Implementation Checklist (for Apps/Simulators)

When building digital tools for Hambacher Schloss, follow these guidelines to stay "on brand":

- [ ] Use `#C69C79` for primary action elements.
- [ ] Use `Vollkorn` for large display titles.
- [ ] Use `Outfit` for all interactive UI elements and body copy.
- [ ] Maintain a strict **0px border-radius** on all containers and buttons.
- [ ] Provide ample whitespace to allow content to "breathe."
- [ ] Incorporate the Flag-Swoosh motif where appropriate for high-level branding.
