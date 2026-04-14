# Tab Focus Timer

Track how long you spend on each website with daily browsing statistics.

**[Install on Firefox](https://addons.mozilla.org)** · **[View on GitHub](https://github.com/SanFre10/tab_time)**

---

## Features

- **Per-tab tracking** — Measures time each tab is actively focused
- **Daily statistics** — See your browsing habits organized by day
- **Site icons** — Each website displays its favicon for easy identification
- **Visit counts** — Track how many times you visited each site
- **Date navigation** — Browse through past days to review history
- **Dark theme** — Clean dark UI that matches Firefox's aesthetic
- **Local storage** — All data stays on your device, no cloud sync

## Installation

### From Firefox Add-ons

1. Download `tab-focus-timer.zip` from the releases
2. Go to `about:addons`
3. Click the gear icon → "Install Add-on From File..."
4. Select the ZIP file

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/SanFre10/tab_time.git
   ```
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select `manifest.json` from the cloned folder

## Usage

1. Click the extension icon in the toolbar to open the popup
2. View today's browsing statistics sorted by time spent
3. Use the arrow buttons to navigate between days
4. Each entry shows the website, total time, and visit count
5. The currently active tab is highlighted

## Screenshots

*Coming soon*

## Permissions

| Permission | Purpose |
|------------|---------|
| `tabs` | Access tab information to track active tab |
| `webNavigation` | Detect tab navigation and URL changes |
| `storage` | Save browsing statistics locally |
| `<all_urls>` | Track time on any website |

## Privacy

This extension stores all data **locally in your browser**. No data is collected, transmitted, or shared with any third party.

See [PRIVACY.md](PRIVACY.md) for full details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
