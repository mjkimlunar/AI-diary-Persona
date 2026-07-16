export default function CommentView({ entry, persona, onWriteAgain, onGoHistory }) {
  return (
    <div className="screen">
      <h1>{persona.avatar_emoji} {persona.name}의 한마디</h1>

      <div className="entry-card">
        <div className="entry-mood">{entry.mood}</div>
        <p className="entry-content">{entry.content}</p>
      </div>

      <div className="comment-bubble">
        {entry.ai_comment ? (
          <p>{entry.ai_comment}</p>
        ) : (
          <p className="muted">코멘트를 불러오지 못했어요. 히스토리에서 다시 확인해보세요.</p>
        )}
      </div>

      <div className="action-row">
        <button className="primary-btn" onClick={onWriteAgain}>다시 쓰기</button>
        <button className="secondary-btn" onClick={onGoHistory}>히스토리 보기</button>
      </div>
    </div>
  )
}
