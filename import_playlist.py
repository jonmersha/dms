import os
import json
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dms.settings')
django.setup()

from public_pages.models import LearningPlaylist, LearningEpisode, Quiz, QuizQuestion, QuizAnswer

def main():
    # Read the JSONL file
    videos = []
    with open('playlist.jsonl', 'r') as f:
        for line in f:
            if line.strip():
                videos.append(json.loads(line))

    # Create the playlist
    playlist, created = LearningPlaylist.objects.get_or_create(
        title="Leadership and Management Skills",
        defaults={
            'description': "A comprehensive course on leadership, management, and startup success.",
            'main_url': videos[0]['url'] if videos else '',
            'playlist_id': 'PLBF2274F16AD935FB',
            'order': 10
        }
    )
    if not created:
        print("Playlist already exists. Deleting existing episodes to recreate...")
        playlist.episodes.all().delete()

    order = 1
    chunk_size = 10
    subsection_num = 1

    # Chunk the videos
    for i in range(0, len(videos), chunk_size):
        chunk = videos[i:i + chunk_size]
        
        # Add video episodes
        for video in chunk:
            LearningEpisode.objects.create(
                playlist=playlist,
                title=f"Section {subsection_num}: {video['title']}",
                content_type='video',
                video_url=video['url'],
                order=order
            )
            order += 1

        # Add subsection quiz
        quiz_episode = LearningEpisode.objects.create(
            playlist=playlist,
            title=f"Subsection {subsection_num} Quiz",
            content_type='quiz',
            content_text=f"Test your knowledge on Subsection {subsection_num}",
            order=order
        )
        order += 1

        quiz = Quiz.objects.create(
            episode=quiz_episode,
            title=f"Quiz: Subsection {subsection_num}",
            description=f"5 questions covering Subsection {subsection_num} topics.",
            passing_score=60
        )

        for q_num in range(1, 6): # Max 5 questions
            question = QuizQuestion.objects.create(
                quiz=quiz,
                text=f"Sample Question {q_num} for Subsection {subsection_num}?",
                order=q_num
            )
            for a_num, is_correct in [(1, True), (2, False), (3, False), (4, False)]:
                QuizAnswer.objects.create(
                    question=question,
                    text=f"Option {a_num}",
                    is_correct=is_correct
                )
        
        subsection_num += 1

    # Add final quiz with 10 questions
    final_quiz_episode = LearningEpisode.objects.create(
        playlist=playlist,
        title="Final Course Assessment",
        content_type='quiz',
        content_text="Final assessment covering all topics.",
        order=order
    )

    final_quiz = Quiz.objects.create(
        episode=final_quiz_episode,
        title="Final Assessment",
        description="10 questions covering the entire course.",
        passing_score=70
    )

    for q_num in range(1, 11):
        question = QuizQuestion.objects.create(
            quiz=final_quiz,
            text=f"Final Assessment Question {q_num}?",
            order=q_num
        )
        for a_num, is_correct in [(1, False), (2, True), (3, False), (4, False)]:
            QuizAnswer.objects.create(
                question=question,
                text=f"Option {a_num}",
                is_correct=is_correct
            )

    print(f"Successfully created playlist '{playlist.title}' with {playlist.episodes.count()} episodes (including quizzes).")

if __name__ == '__main__':
    main()
