import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Star, Play } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";

interface ContentCardProps {
  title: string;
  image: string;
  rating: number;
  year: string;
  genre: string;
  duration?: string;
}

export function ContentCard({ title, image, rating, year, genre, duration }: ContentCardProps) {
  return (
    <Card 
      className="group overflow-hidden border-0 bg-card shadow-md hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-secondary text-secondary-foreground border-0">
            {genre}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-card-foreground mb-2 line-clamp-1">{title}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-secondary text-secondary" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <span>{year}</span>
          {duration && <span>{duration}</span>}
        </div>
      </div>
    </Card>
  );
}