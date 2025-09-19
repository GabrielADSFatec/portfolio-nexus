// components/ui/PlaceholderImage.tsx
import Image from 'next/image';

interface PlaceholderImageProps {
  width: number;
  height: number;
  alt?: string;
  className?: string;
}

export default function PlaceholderImage({ 
  width, 
  height, 
  alt = "Placeholder image", 
  className = "" 
}: PlaceholderImageProps) {
  const placeholderUrl = `https://picsum.photos/${width}/${height}?random=1`;
  
  return (
    <Image
      src={placeholderUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}