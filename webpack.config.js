module.exports = {
    mode: "production",
    entry: "./src/index.js",
    output: {
        filename: 'jhoo-spider.js',
        clean: true,
        library: {
            name: 'JhooSpider',
            type: 'umd',
        }
    }
}