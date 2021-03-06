const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    let likes = blogs.map(blog => {
        return blog.likes
    })

    const reducer = (sum, item) => {
        return sum + item
    }
    return blogs.length === 0
        ? 0
        : likes.reduce(reducer, 0)
}

module.exports = {
    dummy,
    totalLikes
}