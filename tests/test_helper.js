const Blog = require('../models/blog')


const initialBlogs = [
    {
      title: 'Ensimmäinen testiblogi',
      author: 'Ekan kirjoittaja',
      url: 'www.eka.fi',
      likes: 40
    },
    {
      title: 'Toinen testiblogi',
      author: 'Toisen kirjoittaja',
      url: 'www.toinen.com',
      likes: 16
    },
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    initialBlogs, blogsInDb
}