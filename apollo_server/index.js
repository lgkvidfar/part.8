const { createServer } = require('http')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require("express");
const { webSocketServer } = require('ws')
const { userServer }= require('graphql-ws/lib/use/ws')


const { ApolloServer, UserInputError, gql, AuthenticationError } = require('apollo-server')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'secret'

const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const MONGODB_URI = 'mongodb+srv://fullstack:nioka20@cluster0.nkjni.mongodb.net/gqllibrary?retryWrites=true&w=majority'
console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, 
    { useNewUrlParser: true, 
        useUnifiedTopology: true, 
    })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

  mongoose.set('debug', true);


const typeDefs = gql`
  type User {
    username: String!
    password: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Author {
    name: String!
    born: String
    authorsBooks: [Book!]
    authorsBooksCount: Int
  }

  type Book {
    title: String!
    published: Int!
    author: Author
    genres: [String!]!
  }

  type Query {
    authorCount: Int!
    bookCount: Int!
    allAuthors: [Author!]!
    allBooks(genre: String): [Book!]!
    me: User
  }

  type Mutation {
    addAuthor(
        name: String!
        born: Int!
        ): Author
    addBook(
        title: String!
        published: Int!
        author: String!
        genres: [String!]!
        ): Book
    editBookPublished(
        title: String!
        published: Int!
        ): Book
    editBookTitle(
        title: String!
        newTitle: String!
        ): Book
    editBookAuthor(
        title: String!
        author: String!
        ): Book
    editAuthorBirth(
        name: String!
        born: Int!
        ): Author
      createUser(
          username: String!
          password: String!
          favoriteGenre: String!
        ): User
      login(
        username: String!
        password: String!
        ): Token
  }  

  type Subscription {
    bookAdded: Book!
    authorAdded: Author!
  }
`

const resolvers = {
  Query: {
    bookCount: async () => {
        const books = await Book.find({ })
        console.log("bookCount");

        return books.length
      },
    allBooks: async (root, args) => {
      if(args.genre) {
        const books  = await Book.find({ genres: args.genre })
          console.log(books)
          return books
      }
        const books = await Book.find({ })
        return books
      },
    authorCount: async () => {
        const authors = await Author.find({ })
        return authors.length
      },
    allAuthors: async () => {
        const authors = await Author.find({  })
        console.log("allAuthors");
        return authors
      },
    me: async (_root,__args,context) => {
        const user = context.currentUser
        console.log(user)
        if(user !== undefined){
          console.log(user)
          return user
        } else {
          return "no user here"
        }

      }
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
        if (!currentUser) {
        throw new AuthenticationError("not authenticated")
        }
        const book = new Book({ ...args })
        try {
          await book.save()
        } catch (error) {
          throw new UserInputError(error.message, { 
              invalidArgs: args,
            })
        }  
        pubsub.publish('BOOK_ADDED', { 
          bookAdded: book 
        })
        return book
    },
    addAuthor: async (root, args, { currentUser }) => {
        if (!currentUser) {
        throw new AuthenticationError("not authenticated")
        }
        const author = new Author({ ...args })
        try {
            author.save()
        } catch (error) {
        throw new UserInputError(error.message, { 
            invalidArgs: args,
            })
        }
        pubsub.publish('AUTHOR_ADDED', { 
          authorAdded: author 
        })
        return author
    },
    editAuthorBirth: async (root, args, {currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
        }
        const author = await Author.findOne({ name: args.name })
        try {
            author.born = args.born
            author.save()
        } catch (error) {
        throw new UserInputError(error.message, {
            invalidArgs: args,
        })
        }
        return author
    },
    editBookPublished: async (root, args, { currentUser}) => {
        if (!currentUser) {
        throw new AuthenticationError("not authenticated")
        }
        const book = await Book.findOne({ title: args.title })
        try {
            book.published = args.published
            book.save()
        } catch (error) {
        throw new UserInputError(error.message, {
            invalidArgs: args,
        })
        }
        return book
    },
    editBookTitle: async (root, args, { currentUser }) => {
        if (!currentUser) {
        throw new AuthenticationError("not authenticated")
        }
        const book = await Book.findOne({ title: args.title })
        try {
            book.title = args.newTitle
            book.save()
        } catch (error) {
        throw new UserInputError(error.message, {
            invalidArgs: args,
        })
        }
        return book
    },
    editBookAuthor: async (root, args, {currentUser }) => {
        if (!currentUser) {
        throw new AuthenticationError("not authenticated")
        }
        const book = await Book.findOne({ title: args.title })
        try {
            book.author = args.author
            book.save()
        } catch (error) {
        throw new UserInputError(error.message, {
            invalidArgs: args,
        })
        }
        return book
    },
    login: async (_, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== user.password) {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        password: user.passowrd,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
    createUser: async (_, args) => {
      return await new User({ ...args }).save().catch(error => {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      })
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    },
    authorAdded: {
      subscribe: () => pubsub.asyncIterator(['AUTHOR_ADDED'])
    },
  },
  Author: {
        authorsBooksCount: async (root, args) => {
            const books = await Book.find({ author: root.name })
            return books.length
        },
        authorsBooks: async (root,args) => {
            const books = await Book.find({ author: root.name })
            return books
        }
  },
  Book: {
      author: async (root, args) => {
          const author = await Author.findOne({ name: root.author })
          return author
      }
  }
}

const app = express();
const httpServer = createServer(app);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
  plugins: [{
    async serverWillStart() {
      return {
        async drainServer() {
          subscriptionServer.close();
        }
      };
    }
  }],
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7),
        JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

const subscriptionServer = SubscriptionServer.create(
  { schema, execute, subscribe },
  { server: httpServer, path: '/graphql' }
);

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})