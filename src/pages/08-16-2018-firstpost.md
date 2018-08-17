---
path: "/graphl-java-springboot"
date: "2018-08-16"
title: "Schema First Approach to GraphQL Development with GraphQL-Java and Spring Boot"
---

I recently took on a project where we decided to toy with GraphQL to query our data instead of just using a typical controller to build the API with Spring Boot. This was due to have some pretty wide tables where we don't always need all the columns back at once, needless to say working around over-fetching was enticing due to how GraphQL queries work. While the approach may not have been a typical use case for GraphQL through and through, it did solve an immediate problem and it has been quite enjoyable to use. 

From some diligent late night reading, I came across a couple ways to approach writing a GraphQL API with GraphQL-Java: Schema-First and Code-First. Code-First utilizes annotations on your data models to build your data types and annotations on any query/mutation infrastructure you may have to build out your schema. Schema-First involves building out a schema in the GraphQL DSL language into a file with the .graphqls extension. I liked this approach as it kind of felt like implenenting a service using an interface and defined implementation before writing out any actual Java code, which felt a bit more proper to me.

Eventually I would like to learn more about schema stitching and how to aggregate data from multiple APIs together, as that is a more typical GraphQL use case to my understanding.


Below is an example of a schema file I used while building a demo app from different tutorials:

```
type Author {
  id: ID!
  firstName: String!
  lastName: String!
}

type Query {
  findAllAuthors: [Author]!
  countAuthors: Long!
}

type Mutation {
  newAuthor(firstName: String!, lastName: String!) : Author!
}
```

Ideally then, this schema would be reflected in a typical data model like so:

```
@Entity
public class Author {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    private String firstName;

    private String lastName;

    public Author() {
    }

    public Author(Long id) {
        this.id = id;
    }

    public Author(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Author author = (Author) o;

        return id.equals(author.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }

    @Override
    public String toString() {
        return "Author{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                '}';
    }
}
```


Once you've built out a model, you need to write the resolvers as defined in your schema. You can do this by extending `GraphQLQueryResolver` or `GraphQLMutationResolver` and working in any repositories you might have for persistence. Queries and Mutations can be broken out into as many classes as you like if you annotate the classes with `@Component` so their are picked up by the Component Scan in Spring Framework.

Query Resolver
```
public class Query implements GraphQLQueryResolver {
    private BookRepository bookRepository;
    private AuthorRepository authorRepository;

    public Query(AuthorRepository authorRepository, BookRepository bookRepository) {
        this.authorRepository = authorRepository;
        this.bookRepository = bookRepository;
    }

    public Iterable<Book> findAllBooks() {
        return bookRepository.findAll();
    }

    public Iterable<Author> findAllAuthors() {
        return authorRepository.findAll();
    }

    public long countBooks() {
        return bookRepository.count();
    }
    public long countAuthors() {
        return authorRepository.count();
    }
}
```

Mutation Resolver

```
public class Mutation implements GraphQLMutationResolver {
    private BookRepository bookRepository;
    private AuthorRepository authorRepository;

    public Mutation(AuthorRepository authorRepository, BookRepository bookRepository) {
        this.authorRepository = authorRepository;
        this.bookRepository = bookRepository;
    }

    public Author newAuthor(String firstName, String lastName) {
        Author author = new Author();
        author.setFirstName(firstName);
        author.setLastName(lastName);

        authorRepository.save(author);

        return author;
    }

    public Book newBook(String title, String isbn, Integer pageCount, Long authorId) {
        Book book = new Book();
        book.setAuthor(new Author(authorId));
        book.setTitle(title);
        book.setIsbn(isbn);
        book.setPageCount(pageCount != null ? pageCount : 0);

        bookRepository.save(book);

        return book;
    }

    public boolean deleteBook(Long id) {
        Book existingBook = bookRepository.findById(id)
            .orElseThrow(() -> new BookNotFoundException("The book to be updated was found", id));
        bookRepository.delete(existingBook);
        return true;
    }

    public Book updateBookPageCount(Integer pageCount, Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new BookNotFoundException("The book to be updated was found", id));

        book.setPageCount(pageCount);

        bookRepository.save(book);

        return book;
    }
}
```

I have a full example located in my demo repository located [here](https://github.com/rpmcdougall/spring-graphqldemo). 