import { relations } from "drizzle-orm/relations";
import { posts, comments, users, friends } from "./schema";

export const commentsRelations = relations(comments, ({one}) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
}));

export const postsRelations = relations(posts, ({one, many}) => ({
	comments: many(comments),
	user: one(users, {
		fields: [posts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	comments: many(comments),
	friends_userId2: many(friends, {
		relationName: "friends_userId2_users_id"
	}),
	friends_userId1: many(friends, {
		relationName: "friends_userId1_users_id"
	}),
	posts: many(posts),
}));

export const friendsRelations = relations(friends, ({one}) => ({
	user_userId2: one(users, {
		fields: [friends.userId2],
		references: [users.id],
		relationName: "friends_userId2_users_id"
	}),
	user_userId1: one(users, {
		fields: [friends.userId1],
		references: [users.id],
		relationName: "friends_userId1_users_id"
	}),
}));