with open('frontend/src/pages/public/Learning.tsx', 'r') as f:
    code = f.read()

# 1. Update Episode interface
old_interface = """  is_completed: boolean;
  quiz?: Quiz;
}"""
new_interface = """  is_completed: boolean;
  last_position?: number;
  quiz?: Quiz;
}"""
if old_interface in code:
    code = code.replace(old_interface, new_interface)

# 2. Update startVideoTracking
old_tracking = """  const startVideoTracking = (player: any) => {
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    videoIntervalRef.current = setInterval(async () => {
      try {
        const currentTime = await player.getCurrentTime();
        const duration = await player.getDuration();
        if (duration > 0) {
          setVideoProgress((currentTime / duration) * 100);
        }
      } catch (e) {
        // ignore
      }
    }, 1000);
  };"""
  
new_tracking = """  const startVideoTracking = (player: any) => {
    let ticks = 0;
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    videoIntervalRef.current = setInterval(async () => {
      try {
        const currentTime = await player.getCurrentTime();
        const duration = await player.getDuration();
        if (duration > 0) {
          setVideoProgress((currentTime / duration) * 100);
        }
        
        ticks++;
        if (ticks % 10 === 0 && currentEpisode && user) {
          api.post(`/api/lms/learning-episodes/${currentEpisode.id}/save_progress/`, { position: currentTime })
             .catch(e => console.error("Failed to save progress", e));
        }
      } catch (e) {
        // ignore
      }
    }, 1000);
  };"""

if old_tracking in code:
    code = code.replace(old_tracking, new_tracking)
    
# 3. Update opts
old_opts = """  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
    },
  };"""
  
new_opts = """  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      start: currentEpisode?.last_position || 0,
    },
  };"""

if old_opts in code:
    code = code.replace(old_opts, new_opts)

with open('frontend/src/pages/public/Learning.tsx', 'w') as f:
    f.write(code)

