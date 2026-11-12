import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, size = 16, showCount = false, count = 0, interactive = false, onChange }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          onClick={() => interactive && onChange && onChange(star)}
          className={`${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
            ${interactive ? 'cursor-pointer hover:text-amber-400 hover:fill-amber-400 transition-colors' : ''}`}
        />
      ))}
      {showCount && <span className="text-sm text-gray-500 ml-1">({count})</span>}
    </div>
  );
};

export default StarRating;
