# Store listing — One-Click Password Generator

Ready-to-paste text for the Chrome Web Store and Firefox Add-ons (AMO).

## Name

One-Click Password Generator

## Short summary

Chrome uses the manifest `description` (max. 132 characters). AMO asks for a summary (max. 250 characters).

> Generate a strong random password and copy it to your clipboard in one click.

## Full description

Need a new password? Click the toolbar icon and a strong, random password is already on your clipboard. Just paste it with Ctrl+V (Cmd+V on Mac).

**How it works**
- Click the extension icon. A new password is generated and copied right away.
- Need another one? Click "Copy new password".
- The password is never shown on screen, so nobody can read it over your shoulder.

**Your preferences**
- Choose which characters to include: lowercase, uppercase, numbers and special characters.
- Pick a length from 12 to 64 characters (20 by default).
- Your choices are saved and used for every new password.
- Each selected character type appears at least once in every password.

**Built for security and privacy**
- Uses your browser's cryptographically secure random generator (Web Crypto API).
- Every character has exactly the same chance of being picked.
- Passwords are never stored, logged or sent anywhere. They exist only long enough to be copied.
- No tracking, no analytics, no ads and no network requests.
- Minimal permissions: only clipboard write access and storage for your preferences.
- No access to your tabs, browsing history or the websites you visit.
- No third-party code.

## Category

- Chrome Web Store: Tools (or Productivity)
- Firefox Add-ons: Privacy & Security

## Chrome Web Store: Privacy practices tab

**Single purpose**

> Generate a random password and copy it to the clipboard with one click.

**Permission justifications**

| Permission | Justification |
| --- | --- |
| `clipboardWrite` | Copies the generated password to the clipboard as soon as the user opens the popup or clicks "Copy new password". |
| `storage` | Saves the user's password preferences (length and character types) so they are used for new passwords. |

**Remote code:** No, I am not using remote code.

**Data usage:** The extension does not collect or transmit any user data.

## Privacy policy (optional)

> One-Click Password Generator does not collect, store or transmit any personal data. Generated passwords are never saved or sent anywhere. The only data stored is your password preferences (length and character types), kept in your browser's extension storage and synced by your browser if sync is enabled.
