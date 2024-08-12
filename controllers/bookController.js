// import { error } from "console";
// import moment from 'moment';
import Books from "../models/bookModel.js";
import { Op } from 'sequelize';

const genreTypes = ['Education', 'Religion', 'Kids', 'Family', 'Health', 'Politics',
  'Business', 'Literature', 'Science', 'Art', 'Sport', 'Others']; // 12 genreTypes

// Function to validate genre
const isValidGenre = (genre) => {
  return genreTypes.some(validGenre => validGenre.toLowerCase() === genre.toLowerCase());
};

// Regex to validate title fields
// ^: Asserts the start of the string
// [A-Za-z] : Ensures the title starts with an alphabetic letter (either uppercase or lowercase)
// [\w\s.,;:'"?!()\-]* : Allows zero or more of the following characters after the initial letter:
// \w: any word character (letters, digits, and underscores)
//  \s: any whitespace character (spaces, tabs, etc.)
//  .,;:'"?!()\-: specific punctuation characters
// $: Asserts the end of the string
const titleRegex = /^[A-Za-z][\w\s.,;:'"?!()\-]*$/;

// Regex to validate author fields
// - ^ and $ ensure the entire string is matched.
// [A-Za-z] : Ensures the title starts with an alphabetic letter (either uppercase or lowercase)
// - \p{L} matches any kind of letter from any language (including accented and non-Latin characters).
// - The characters .'- inside square brackets [] are special characters that are allowed in the author's name (e.g., "Jean-Luc", "O'Reilly", "Dr. Seuss").
// - The + quantifier matches one or more occurrences of the allowed characters.
// - The u flag allows Unicode characters to be matched.
const authorRegex = /^[A-Za-z][\p{L} .'-]*$/u;

// Regex to validate date in YYYY-MM-DD format
// - ^ asserts the position at the start of the string.
// - \d{4} matches exactly four digits for the year (YYYY).
// - - matches a literal hyphen (separator between year, month, and day).
// - \d{2} matches exactly two digits for the month (MM).
// - - matches another literal hyphen (separator between month and day).
// - \d{2} matches exactly two digits for the day (DD).
// - $ asserts the position at the end of the string, ensuring the entire string matches the pattern without extra characters.
// Example of a valid date: "2024-08-09"
// Example of an invalid date: "2024-8-9" (month and day need two digits each)
// The u flag enables Unicode matching.
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Method to add/create books
export const addBook = async (req, res) => {
  try {
    const { title, author, genre, quantity, description, publishedDate } = req.body;
    if (!title || !author || !genre || !quantity) {
      return res.status(500).json({ error: 'title, author, genre and quantity fields are important' });
    }

    // Validate title using regex
    if (!titleRegex.test(title)) {
      return res.status(400).json({ error: 'Invalid title. Title can only begin with letter and may only contain letters, numbers, and certain special characters.' });
    }

    // Validate author using regex
    if (!authorRegex.test(author)) {
      return res.status(400).json({ error: 'Invalid author name. Author name can only begin with letter and may only contain letters, spaces, periods, hyphens, and apostrophes.' });
    }

    // Check if genre is valid (case-insensitive)
    if (!isValidGenre(genre)) {
      return res.status(400).json({ error: `Invalid genre. Genre Types include: ${genreTypes.join(', ')}` });
    }

    // Check if quantity is a positive integer
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    // Validate publishedDate format (assuming it's in YYYY-MM-DD format)
    if (!publishedDate || !dateRegex.test(publishedDate)) {
      console.log(publishedDate);
      return res.status(400).json({ error: 'Published Date must be in YYYY-MM-DD format. Example: 2024-08-09' });
    }

    // Format the date as YYYY-MM-DD
    // const formattedDate = publishedDate ? moment(publishedDate).format('YYYY-MM-DD') : null;

    // Check if a book with the same title, author, and publishedDate already exists
    const existingBook = await Books.findOne({
      where: {
        title: title.toLowerCase(),
        author: author.toLowerCase()
      }
    });

    if (existingBook) {
      return res.status(400).json({ error: 'A book with the same title and author already exists' });
    }

    const newBook = await Books.create({
      title: title.toLowerCase(),
      author: author.toLowerCase(),
      genre: genre.toLowerCase(),
      quantity,
      description,
      publishedDate
    });

    // return res.status(201).json(newBook);
    return res.status(201).json({ message: 'Book added successfully', newBook });
  } catch (error) {
    console.log(`Error Adding Books: ${error.message}`)
    return res.status(500).json({ error: `Error Adding Books: ${error.message}` });
  }
};

// Method gets all books
export const allBook = async (req, res) => {
  try {
    const books = await Books.findAll();

    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ error: `Getting all books: ${error.message}` });
  }
};

// Method to find book based on ID
export const BookById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    const book = await Books.findByPk(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ error: `Error deleting book: ${error.message}` });
  }
}

// Method finds book based on genreTypes
export const search = async (req, res) => {
  const { genre, author, title } = req.query;

  if (!genre && !author && !title) {
    return res.status(400).json({ error: 'You can either search by genre, title or author.' });
  }

  try {
    const searchType = {};

    if (genre) {
      if (!isValidGenre(genre)) {
        return res.status(400).json({ error: `Invalid genre. Genre Types include: ${genreTypes.join(', ')}` });
      }
      searchType.genre = { [Op.iLike]: `%${genre}%` }; // Case-insensitive search for genre;
      // console.log(searchType);
    }

    if (title) {
      // Validate title using regex
      if (!titleRegex.test(title)) {
        return res.status(400).json({ error: 'Invalid title. Title can only begin with letter and may only contain letters, numbers, and certain special characters.' });
      }
      searchType.title = { [Op.iLike]: `%${title}%` }; // Case-insensitive search for title
    }

    if (author) {
      // Validate author using regex
      if (!authorRegex.test(author)) {
        return res.status(400).json({ error: 'Invalid author name. Author name can only begin with letter and may only contain letters, spaces, periods, hyphens, and apostrophes.' });
      }
      searchType.author = { [Op.iLike]: `%${author}%` }; // Case-insensitive search for author
    }

    // Find books based on the search criteria
    const books = await Books.findAll({ where: searchType });

    // If no books are found, return a message
    if (books.length === 0) {
      return res.status(404).json({ message: 'No books found matching the search criteria.' });
    }

    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ error: `Error searching: ${error.message}` });
  }
}

// Method to delete books
export const deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    const book = await Books.findByPk(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    // console.log(book);
    await Books.destroy({ where: { id } });

    return res.status(200).json({ message: `Book with ID ${id} and title (${book.title}) and author (${book.author}) was successfully deleted.` });
  } catch (error) {
    return res.status(500).json({ error: `Error deleting book: ${error.message}` });
  }
}

// Method to edit books
export const editBook = async (req, res) => {
  const { id } = req.params;
  let { title, author, genre, quantity, description, publishedDate } = req.body;
  // console.log(id);
  try {
    if (!id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    // Find book by ID
    const book = await Books.findByPk(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Validate title using regex
    if (title) {
      if (!titleRegex.test(title)) {
        return res.status(400).json({ error: 'Invalid title. Title can only begin with letter and may only contain letters, numbers, and certain special characters.' });
      }
      title = title.toLowerCase();
      if (book.title === title) {
        return res.status(400).json({ error: 'Title cannot be changed because it contains the same title' })
      }
    }

    // Validate author using regex
    if (author) {
      if (!authorRegex.test(author)) {
        return res.status(400).json({ error: 'Invalid author name. Author name can only begin with letter and may only contain letters, spaces, periods, hyphens, and apostrophes.' });
      }
      author = author.toLowerCase();
      if (book.author === author) {
        return res.status(400).json({ error: 'Author cannot be changed because it contains the same author' })
      }
    }

    // Check if genre is valid (case-insensitive)
    if (genre) {
      if (!isValidGenre(genre)) {
        return res.status(400).json({ error: `Invalid genre. Genre Types include: ${genreTypes.join(', ')}` });
      }
      genre = genre.toLowerCase();
      if (book.genre === genre) {
        return res.status(400).json({ error: 'Genre cannot be changed because it contains the same genre' })
      }
    }

    // Check if quantity is a positive integer
    if (quantity) {
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be a positive integer' });
      }
      // quantity = quantity.toLowerCase();
      if (book.quantity === quantity) {
        return res.status(400).json({ error: 'Quantity cannot be changed because it contains the same quantity' })
      }
    }

    // Validate publishedDate format (assuming it's in YYYY-MM-DD format)
    // let formattedDate = null;
    if (publishedDate) {
      if (!publishedDate || !dateRegex.test(publishedDate)) {
        console.log(publishedDate);
        return res.status(400).json({ error: 'Published Date must be in YYYY-MM-DD format. Example: 2024-08-09' });
      }
      // Format the date as YYYY-MM-DD
      // formattedDate = moment(publishedDate).format('YYYY-MM-DD');

      if (book.publishedDate === publishedDate) {
        return res.status(400).json({ error: 'PublishedDate cannot be changed because it contains the same publishedDate' })
      }
    }

    // Validate description
    if (description) {
      if (book.description === description) {
        return res.status(400).json({ error: 'Description cannot be changed because it contains the same description' })
      }
    }

    // Update the book fields if they exist in the request body
    const updatedBook = await book.update({
      title: title ? title.toLowerCase() : book.title,
      author: author ? author.toLowerCase() : book.author,
      genre: genre ? genre.toLowerCase() : book.genre,
      quantity: quantity || book.quantity,
      description: description || book.description,
      publishedDate: publishedDate || book.publishedDate,
    });

    return res.status(200).json({ message: 'Book updated successfully', book });
  } catch (error) {
    console.log(`Error Updating Books: ${error.message}`)
    return res.status(500).json({ error: `Error Updating Books: ${error.message}` });
  }
}
