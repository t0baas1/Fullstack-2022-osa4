const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')


beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a valid blog can be added ', async () => {
    const newBlog = {
        title: "Testauksen Blog",
        author: "Testikäyttäjä testaaja",
        url: "www.testi.net",
        likes: 666
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain(
        'Testauksen Blog'
    )
})

test('a blog with no likes gets default likes of 0', async () => {
    const noLikes = {
        title: "No Likes",
        author: "Mr. No Likes",
        url: "www.nolikes.io"
    }

    const savedBlog = await api
        .post('/api/blogs')
        .send(noLikes)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    const finalBlogs = await helper.blogsInDb()
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length + 1)

    expect(savedBlog.body.likes).toBe(0)
})

test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).not.toContain(blogToDelete.title)

})


test('blogs have id and not _id', async () => {
    const blogs = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
    expect(blogs.body[0].id).toBeDefined
    expect(blogs.body[0]).not.toHaveProperty('_id')
})

test('blog with no title and url will return code 400', async () => {
    const invalidBlog ={
        author: 'Invalid',
        likes: 1000
    }

    await api
        .post('/api/blogs')
        .send(invalidBlog)
        .expect(400)
})

test('blog can be updated', async () => {
    blogToEdit = (await helper.blogsInDb())[0]
    const id = blogToEdit.id
    blogToEdit.title = 'New Title'

    const response = await api
        .put(`/api/blogs/${id}`)
        .send(blogToEdit)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const editedBlogs = await helper.blogsInDb()
    expect(editedBlogs.filter(blog => blog.id === id)[0].title).toBe('New Title')

})

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user  =new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(users => users.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async() => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        
        expect(result.body.error).toContain('username must be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if username or password too short', async() => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'aa',
            name: 'Too Short Username Or Password',
            password: 'salasana',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        
        expect(result.body.error).toContain('username or password too short')
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

    })
})

afterAll(() => {
    mongoose.connection.close()
})