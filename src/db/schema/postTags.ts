import { relations } from 'drizzle-orm';
import { integer, pgTable } from 'drizzle-orm/pg-core';
import { post } from './post';
import { tag } from './tag';

export const postTags = pgTable(
	'post_to_tag',
	{
		postId: integer('post_id')
			.notNull()
			.references(() => post.id),
		tagId: integer('tag_id')
			.notNull()
			.references(() => tag.id),
	},
);

export const postTagsRelations = relations(postTags, ({ one }) => ({
	tag: one(tag, { fields: [postTags.tagId], references: [tag.id] }),
	post: one(post, { fields: [postTags.postId], references: [post.id] }),
}));
