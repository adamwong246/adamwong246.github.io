import jade from "jade";

export const jadeRender = (content, pageLayout, locals) => {
	return jade.render(content, {
		filename: pageLayout.src,
		...locals
	})
}

export const jadeRenderPageLayout = (content, pageLayout, locals) => {

	const l = {
		filename: pageLayout.src,
		page: {
			content: content
		},

		...locals
	}

	return jade.render(pageLayout.content, l)
}

export const jadeRenderBlogEntry = (blogEntry, blogEntryLayout, locals) => {
	return jade.render(blogEntryLayout.content, {
		filename: blogEntryLayout.src,
		entry: blogEntry,
		page: {
			content: blogEntry.markdownContent,
		},
		...locals
	})
}