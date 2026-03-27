import { relations } from "drizzle-orm/relations";
import { wikiCategories, wikiArticles } from "./schema";

export const wikiCategoriesRelations = relations(wikiCategories, ({one, many}) => ({
	wikiCategory: one(wikiCategories, {
		fields: [wikiCategories.parentId],
		references: [wikiCategories.id],
		relationName: "wikiCategories_parentId_wikiCategories_id"
	}),
	wikiCategories: many(wikiCategories, {
		relationName: "wikiCategories_parentId_wikiCategories_id"
	}),
	wikiArticles: many(wikiArticles),
}));

export const wikiArticlesRelations = relations(wikiArticles, ({one}) => ({
	wikiCategory: one(wikiCategories, {
		fields: [wikiArticles.categoryId],
		references: [wikiCategories.id]
	}),
}));