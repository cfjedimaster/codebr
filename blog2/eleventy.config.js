export default async function(eleventyConfig) {

	eleventyConfig.addPassthroughCopy("assets");
	eleventyConfig.addWatchTarget("assets");

	eleventyConfig.addFilter("niceDate", d => {
		return new Intl.DateTimeFormat('en-US', {
			dateStyle:'long'
		}).format(d);
	});
};