module.exports = {
    plugins: [
        require('autoprefixer')([
            "last 2 major version",
            ">= 1%",
            "Chrome >= 45",
            "Firefox >= 38",
            "Edge >= 12",
            "Explorer >= 10",
            "iOS >= 9",
            "Safari >= 9",
            "Android >= 4.4",
            "Opera >= 30"
        ])
    ]
}