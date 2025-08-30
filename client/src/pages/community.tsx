import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Heart, MessageCircle, Share, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function Community() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    location: "",
  });

  const { data: communityPosts, isLoading } = useQuery({
    queryKey: ["/api/community/posts"],
  });

  const { data: communityStats } = useQuery({
    queryKey: ["/api/community/stats"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: typeof newPost) => {
      const response = await apiRequest("POST", "/api/community/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      setIsCreatePostOpen(false);
      setNewPost({ title: "", content: "", location: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/stats"] });
      toast({
        title: "Success",
        description: "Your post has been created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest("POST", `/api/community/posts/${postId}/like`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({
        title: "Liked!",
        description: "You liked this post",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLike = (postId: string) => {
    likePostMutation.mutate(postId);
  };

  const handleComment = (postId: string) => {
    // TODO: Implement comment functionality
    console.log("Comment on post:", postId);
  };

  const handleShare = (postId: string) => {
    if (navigator.share) {
      navigator.share({
        title: "FarmConnect Community Post",
        text: "Check out this post from the farming community!",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard",
      });
    }
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-6 flex items-center" data-testid="community-header">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
          className="mr-4"
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold flex-1" data-testid="page-title">
          {t("community.title")}
        </h1>
        <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
          <DialogTrigger asChild>
            <Button size="icon" data-testid="button-create-post">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What would you like to share?"
                  data-testid="input-post-title"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your farming experience, question, or advice..."
                  rows={4}
                  data-testid="textarea-post-content"
                />
              </div>
              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={newPost.location}
                  onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Your village, district"
                  data-testid="input-post-location"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreatePostOpen(false)}
                  data-testid="button-cancel-post"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                  data-testid="button-submit-post"
                  className="flex-1"
                >
                  {createPostMutation.isPending ? (
                    <>
                      <Send className="mr-2 h-4 w-4 animate-pulse" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Share Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="p-6 space-y-6">
        {/* Community stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card data-testid="stat-farmers">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {communityStats?.totalFarmers || "2.5K"}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("community.totalFarmers")}
              </div>
            </CardContent>
          </Card>
          <Card data-testid="stat-posts">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                {communityStats?.activePosts || "450"}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("community.activePosts")}
              </div>
            </CardContent>
          </Card>
          <Card data-testid="stat-help-rate">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">
                {communityStats?.helpRate || "95%"}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("community.helpRate")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Community posts */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} data-testid={`post-skeleton-${index}`}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-24 mb-4"></div>
                        <div className="h-4 bg-muted rounded w-full mb-2"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : communityPosts && communityPosts.length > 0 ? (
            communityPosts.map((post: any, index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card data-testid={`post-${post.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar data-testid={`avatar-${post.id}`}>
                        <AvatarFallback>
                          {post.user?.name?.substring(0, 2)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-foreground" data-testid={`author-${post.id}`}>
                            {post.user?.name || "Anonymous Farmer"}
                          </h4>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span data-testid={`location-${post.id}`}>
                              {post.user?.location || "Farm Location"}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-sm" data-testid={`time-${post.id}`}>
                            • {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-foreground mb-4" data-testid={`content-${post.id}`}>
                          {post.content}
                        </p>
                        
                        {/* Post images */}
                        {post.images && post.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-4" data-testid={`images-${post.id}`}>
                            {post.images.map((image: string, imgIndex: number) => (
                              <img
                                key={imgIndex}
                                src={image}
                                alt={`Post image ${imgIndex + 1}`}
                                className="rounded-lg object-cover h-32 w-full"
                                data-testid={`image-${post.id}-${imgIndex}`}
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex items-center space-x-6 text-muted-foreground">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className="p-0 h-auto"
                            data-testid={`button-like-${post.id}`}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            <span>{post.likes || 0}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleComment(post.id)}
                            className="p-0 h-auto"
                            data-testid={`button-comment-${post.id}`}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            <span>{post.comments || 0}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(post.id)}
                            className="p-0 h-auto"
                            data-testid={`button-share-${post.id}`}
                          >
                            <Share className="h-4 w-4 mr-2" />
                            <span>{t("community.share")}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            // Empty state
            <Card data-testid="empty-state">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share your farming experience with the community!
                </p>
                <Button data-testid="button-create-first-post">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
