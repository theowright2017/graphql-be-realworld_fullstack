import { GraphQLError } from "graphql";
import { createUser, login } from "../../helpers/auth";
import jwt from "jsonwebtoken";
import {
	addCommentToArticleDB,
	createNewArticle,
	deleteArticleDB,
	deleteCommentFromArticleDB,
	getArticle,
	getCommentsFromArticleDB,
	listArticlesDB,
	updateArticleDB,
} from "../../helpers/dbHelpers";

const resolvers = {
	Query: {
		getCurrentUser: async (_, __, ctx) => {
			return ctx.user;
		},
		getArticle: async (_, args, __) => {
			return getArticle(args.input.slug);
		},
		listAllArticles: async (_, args, ctx) => {
			const articles = listArticlesDB(args.filterConditions);

			if (!articles) {
				throw new GraphQLError("NO ARTICLES FOUND", {
					extensions: { code: "INPUT_ERROR" },
				});
			}

			return articles;
		},
	},
	Mutation: {
		createNewUser: async (_, args) => {
			const user = await createUser(args.input);

			if (!user) {
				throw new GraphQLError("could not create user", {
					extensions: { code: "AUTH_ERROR" },
				});
			}

			return user;
		},
		signin: async (_, args) => {
			const user = await login(args.input);

			if (!user || !user.token) {
				throw new GraphQLError("UNAUTHORIZED", {
					extensions: { code: "AUTH_ERROR" },
				});
			}

			return user;
		},
		createNewArticle: async (_, args, ctx) => {
			const currentUser = ctx.user;
			console.log("user:::", currentUser);

			if (!jwt.verify(currentUser.token, process.env.JWT_SECRET)) {
				throw new GraphQLError("INCORRECT_TOKEN", {
					extensions: { code: "AUTH_ERROR" },
				});
			}

			const newArticle = await createNewArticle(
				args.input,
				currentUser.username
			);

			return newArticle;
		},
		updateArticle: async (_, args, ctx) => {
			const currentUser = ctx.user;

			if (!jwt.verify(currentUser.token, process.env.JWT_SECRET)) {
				throw new GraphQLError("INCORRECT_TOKEN", {
					extensions: { code: "AUTH_ERROR" },
				});
			}

			const updatedArticle = await updateArticleDB(
				args.input,
				args.existingSlug,
				currentUser.username
			);

			return updatedArticle;
		},
		deleteArticle: async (_, args, ctx) => {
			const currentUser = ctx.user;

			if (!jwt.verify(currentUser.token, process.env.JWT_SECRET)) {
				throw new GraphQLError("INCORRECT_TOKEN", {
					extensions: { code: "AUTH_ERROR" },
				});
			}

			const deletedArticle = await deleteArticleDB(
				args.input.slug,
				currentUser.username
			);

			return deletedArticle;
		},
		addCommentToArticle: async (_, args, ctx) => {
			const currentUser = ctx.user;

			if (!jwt.verify(currentUser.token, process.env.JWT_SECRET)) {
				throw new GraphQLError("INCORRECT_TOKEN", {
					extensions: { code: "AUTH_ERROR" },
				});
			}

			const addedComment = await addCommentToArticleDB(
				args.input,
				currentUser.username
			);
			return addedComment;
		},
		getCommentsFromArticle: async (_, args, ctx) => {
			const currentUser = ctx.user;

			if (!jwt.verify(currentUser.token, process.env.JWT_SECRET)) {
				throw new GraphQLError("INCORRECT_TOKEN", {
					extensions: { code: "AUTH_ERROR" },
				});
			}

			const comments = await getCommentsFromArticleDB(
				args.slug,
				currentUser.username
			);

			return comments;
		},
		deleteCommentFromArticle: async (_, args, ctx) => {
			const currentUser = ctx.user;

			if (!jwt.verify(currentUser.token, process.env.JWT_SECRET)) {
				throw new GraphQLError("INCORRECT_TOKEN", {
					extensions: { code: "AUTH_ERROR" },
				});
			}

			/**
			 * 	- Might find that we need to also get the articleId by the username as in comment.ts,
			 * 		as opposed to expecting article id in gql input
			 */
			const deletedArticle = await deleteCommentFromArticleDB(args.input);

			return deletedArticle;
		},
	},
};

export { resolvers };
