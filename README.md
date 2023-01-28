# Spotify CLI Utility

A simple command line utility for controlling any Spotify client.

### Installation

-   `make sure node is installed.`
-   `npm install -g spotify-cli-util`

### Usage

-   Use `spotify --help` to see all available commands.
-   `login` Manage user authentication for the CLI utility.
-   `browse` - Open the current track, album, artist, or playlist in the default browser
-   `current` - Get the current track.
-   `devices` - Manage active devices/ .
-   `switch` - Use a specific device from list of available devices.
-   `history` - Get History of your recently played tracks.
-   `next` - Play the next track in the queue.
-   `pause` - Pause playback.
-   `play` - Resume playback, search for a track/album/playlist and play it.
-   `previous` - Play the previous track in the queue.
-   `queue` - Add a track or album to your queue.
-   `repeat` - Turn repeat on (all/track) or off.
-   `shuffle` - Turn shuffle on or off.
-   `toggle` - Resume any paused playback, or pause it if already running.
-   `top` - List your top tracks or artists.
-   `volume` - Control the active device's volume level (0-100).

### Examples

-   `spotify login` - Authenticate the CLI utility.
-   `spotify play` - Resume playback.
-   `spotify play -t "The Less I Know The Better"` - Search for a track and play it.
-   `spotify play -al "Currents"` - Search for an album and play it.
-   `spotify play -p "My Playlist"` - Search for a playlist and play it.
-   `spotify play -a "Tame Impala"` - Search for an artist and play it.

### Contributing

-   Fork the repo.
-   Make your changes.
-   Submit a pull request.

### License

-   MIT

### Credits

-   [Spotify Web API](https://developer.spotify.com/web-api/)

### Disclaimer

-   This is not an official Spotify product.
-   This is not affiliated with Spotify.
-   This is not endorsed by Spotify.
