const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    console.log(blogs[1])
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