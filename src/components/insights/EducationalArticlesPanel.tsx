import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EDUCATIONAL_ARTICLES } from "@/lib/educationalArticles";
import { BookOpen, Clock, ChevronRight, GraduationCap } from "lucide-react";

export function EducationalArticlesPanel() {
  // Get first 10 educational articles
  const articles = EDUCATIONAL_ARTICLES.slice(0, 10);

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          Learn Crypto Fundamentals
        </h2>
        <Link 
          to="/learn" 
          className="text-primary text-sm flex items-center gap-1 hover:underline"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      <p className="text-muted-foreground text-sm mb-6">
        Master cryptocurrency markets with our comprehensive educational guides covering sentiment analysis, 
        AI trading, market cycles, and risk management.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/learn/${article.slug}`}
            className="group"
          >
            <Card className="h-full overflow-hidden border-border/50 hover:border-primary/50 active:scale-[0.98] transition-all hover:shadow-lg hover:shadow-primary/10">
              <CardContent className="p-0">
                {/* Article Header Gradient */}
                <div className="h-24 sm:h-28 bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/10 flex items-center justify-center relative">
                  <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-primary/60" />
                  <Badge 
                    variant="secondary" 
                    className="absolute top-3 left-3 text-[10px] bg-background/80 backdrop-blur-sm"
                  >
                    {article.category}
                  </Badge>
                </div>
                
                <div className="p-4 space-y-3">
                  <h3 className="font-display font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {article.metaDescription}
                  </p>
                  
                  <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {article.primaryKeyword}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
