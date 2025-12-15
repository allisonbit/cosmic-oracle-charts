import { Button } from "@/components/ui/button";
import { 
  Twitter, 
  Facebook, 
  Linkedin, 
  Link2, 
  MessageCircle,
  Send,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SocialShareProps {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  className?: string;
  variant?: 'icons' | 'buttons';
}

export function SocialShare({ 
  title, 
  description = '', 
  url = window.location.href,
  imageUrl,
  className,
  variant = 'icons'
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=oracle_bulls`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  if (variant === 'buttons') {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          className="gap-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] border-[#1DA1F2]/30"
        >
          <Twitter className="w-4 h-4" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('telegram')}
          className="gap-2 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] border-[#0088cc]/30"
        >
          <Send className="w-4 h-4" />
          Telegram
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin')}
          className="gap-2 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] border-[#0A66C2]/30"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleShare('twitter')}
        className="h-8 w-8 hover:bg-[#1DA1F2]/20 hover:text-[#1DA1F2]"
        title="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleShare('facebook')}
        className="h-8 w-8 hover:bg-[#4267B2]/20 hover:text-[#4267B2]"
        title="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleShare('linkedin')}
        className="h-8 w-8 hover:bg-[#0A66C2]/20 hover:text-[#0A66C2]"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleShare('telegram')}
        className="h-8 w-8 hover:bg-[#0088cc]/20 hover:text-[#0088cc]"
        title="Share on Telegram"
      >
        <Send className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopyLink}
        className="h-8 w-8"
        title="Copy link"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
}

// Hook to update Open Graph meta tags dynamically for sharing
export function useShareMeta(meta: {
  title: string;
  description: string;
  image?: string;
  url?: string;
}) {
  const setMeta = (name: string, content: string, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name';
    let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, name);
      document.head.appendChild(tag);
    }
    tag.content = content;
  };

  // Update OG tags
  setMeta('og:title', meta.title, true);
  setMeta('og:description', meta.description, true);
  if (meta.image) setMeta('og:image', meta.image, true);
  if (meta.url) setMeta('og:url', meta.url, true);
  
  // Update Twitter tags
  setMeta('twitter:title', meta.title);
  setMeta('twitter:description', meta.description);
  if (meta.image) setMeta('twitter:image', meta.image);
}
