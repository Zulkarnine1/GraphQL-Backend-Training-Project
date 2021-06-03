const express = require("express")
const { graphqlHTTP } = require("express-graphql");
const {GraphQLSchema, GraphQLObjectType, GraphQLString,GraphQLList, GraphQLID, GraphQLInt,GraphQLNonNull, GraphQLScalarType} = require("graphql")




// Sample data

const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];


const app = express()


// schema defines the query of gql, and the query is all the usecases we may need 
// object contains feilds which refers to all the different sections of the object we can query from, eg the message.
// resolve - what actual info are we returning from the field and how do we get it and return it



// BookType

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book written by an author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author:{
        type:AuthorType,
        resolve:(book)=>{
            return authors.find(author=>{return author.id===book.authorId})
        }
    }
  }),
});


// Author Type

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This represents author of a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
        type: GraphQLList(BookType),
        resolve:(author)=>{ return books.filter(book=>{return book.authorId===author.id})}
    }
  }),
});


// ROOT QUERY
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root query",
  fields: () => ({
    books: {
      type: new GraphQLList(BookType),
      description: "List of all books",
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of all the authors",
      resolve: () => authors,
    },
    book: {
      type: BookType,
      description: "This is a book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => {
        // filter wont work because of booktype
        return books.find((book) => {
          return book.id === args.id;
        });
      },
    },
    author: {
      type: AuthorType,
      description: "This is an author",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => {
        // filter wont work because of booktype
        return authors.find((author) => {
          return author.id === args.id;
        });
      },
    },
  }),
});


// Root mutation 

const RootMutationType = new GraphQLObjectType({
  name: "mutation",
  description: "Root Mutation",
  fields: () => ({
    addBook: {
      type: BookType,
      description: "Add a book",
      args: {
        name: {
          type: GraphQLNonNull(GraphQLString),
        },
        authorId: {
          type: GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };

        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: "Add an author",
      args: {
        name: {
          type: GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name,
        };

        authors.push(author);
        return author;
      },
    },
  }),
});


// Schema

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});


app.use(
  "/graphql",graphqlHTTP({
    graphiql: true,
    schema:schema
  })
);

app.listen(2000, ()=>{
    console.log("Server is up and running");
})