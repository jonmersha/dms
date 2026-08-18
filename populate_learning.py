import os
import django
import sys
import json
import re

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cap.settings')
django.setup()

from lms.models import LearningPlaylist, LearningEpisode

def parse_ts_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    match = re.search(r'export\s+const\s+\w+\s*=\s*\[(.*?)\];', content, re.DOTALL)
    if not match:
        return []
        
    array_str = match.group(1)
    
    episodes = []
    # Match both numeric and string ids, with or without quotes on keys
    obj_matches = re.finditer(r'\{\s*"?id"?\s*:\s*"?([^",\n\r]+)"?\s*,\s*"?title"?\s*:\s*"(.*?)"\s*,\s*"?url"?\s*:\s*"(.*?)"\s*\}', array_str, re.DOTALL)
    
    for i, m in enumerate(obj_matches, start=1):
        episodes.append({
            'order': i,
            'title': m.group(2).strip(),
            'video_url': m.group(3).strip()
        })
    return episodes

def populate():
    LearningPlaylist.objects.all().delete()
    
    playlists_info = [
        {
            'title': 'Internal Auditing Fundamentals',
            'description': 'An introduction to the profession of internal auditing, produced by The Institute of Internal Auditors (IIA). Discover how internal auditors add value to their organizations.',
            'main_url': 'https://www.youtube.com/embed/videoseries?list=PLqFUiQJPcpSHrmrID3WU--CaLKj4hXbH0',
            'playlist_id': 'PLqFUiQJPcpSHrmrID3WU--CaLKj4hXbH0',
            'order': 1,
            'ts_file': 'frontend/src/data/playlistData.ts'
        },
        {
            'title': 'CISM ISACA Complete Course',
            'description': 'A complete course covering ISACA CISM Domains 1 to 6. Enhance your knowledge in Information Security Governance, Risk Management, and more.',
            'main_url': 'https://www.youtube.com/embed/videoseries?list=PLCUK9GC4F-GW6mYlADNzZ3MXR94npH8F6',
            'playlist_id': 'PLCUK9GC4F-GW6mYlADNzZ3MXR94npH8F6',
            'order': 2,
            'ts_file': 'frontend/src/data/isacaPlaylistData.ts'
        },
        {
            'title': 'ISACA CISA Full Course',
            'description': 'A complete course covering ISACA CISA for all domains. Essential for auditing, controlling, monitoring and assessing information technology and business systems.',
            'main_url': 'https://www.youtube.com/embed/videoseries?list=PLCUK9GC4F-GX-vovuYMyVupoqksdufECp',
            'playlist_id': 'PLCUK9GC4F-GX-vovuYMyVupoqksdufECp',
            'order': 3,
            'ts_file': 'frontend/src/data/cisaPlaylistData.ts'
        },
        {
            'title': 'COSO Internal Control Framework',
            'description': 'A detailed exploration of the COSO framework for designing, implementing, and conducting internal control and assessing its effectiveness.',
            'main_url': 'https://www.youtube.com/embed/videoseries?list=PL68AA245BF50F4A8C',
            'playlist_id': 'PL68AA245BF50F4A8C',
            'order': 4,
            'ts_file': 'frontend/src/data/cosoPlaylistData.ts'
        },
        {
            'title': 'ISACA CISA Additional Course',
            'description': 'Further dive into ISACA CISA domains with this supplementary comprehensive playlist covering core auditing subjects.',
            'main_url': 'https://www.youtube.com/embed/videoseries?list=PL7XJSuT7Dq_UvA2knww9Rlzz2JHUpeOAb',
            'playlist_id': 'PL7XJSuT7Dq_UvA2knww9Rlzz2JHUpeOAb',
            'order': 5,
            'ts_file': 'frontend/src/data/cisa2PlaylistData.ts'
        },
        {
            'title': 'The Three Lines of Defense',
            'description': 'Understand the IIA\'s Three Lines Model for effective risk management and control, separating management, oversight, and independent assurance.',
            'main_url': 'https://www.youtube.com/embed/RUodihzIuAw',
            'playlist_id': '',
            'order': 6,
            'ts_file': None
        }
    ]
    
    for info in playlists_info:
        playlist = LearningPlaylist.objects.create(
            title=info['title'],
            description=info['description'],
            main_url=info['main_url'],
            playlist_id=info['playlist_id'],
            order=info['order']
        )
        print(f"Created Playlist: {playlist.title}")
        
        if info['ts_file'] and os.path.exists(info['ts_file']):
            episodes = parse_ts_file(info['ts_file'])
            for ep in episodes:
                LearningEpisode.objects.create(
                    playlist=playlist,
                    title=ep['title'],
                    video_url=ep['video_url'],
                    order=ep['order']
                )
            print(f"  -> Added {len(episodes)} episodes.")
        
if __name__ == '__main__':
    populate()
    print("Done!")
