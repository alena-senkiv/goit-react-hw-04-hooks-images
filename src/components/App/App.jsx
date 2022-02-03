import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchImg } from 'services/pixabay-api';
import { Searchbar } from 'components/Searchbar';
import { ImageGallery } from 'components/ImageGallery';
import { LoadMoreBtn } from 'components/LoadMoreBtn';
import { Loader } from 'components/Loader';
import { ErrorSearch } from 'components/ErrorSearch';
import { Modal } from 'components/Modal';

const PER_PAGE = 12;
const Status = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

const App = () => {
  const [status, setStatus] = useState(Status.IDLE);
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState([]);
  const [totalHits, setTotalHits] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalImgUrl, setModalImgUrl] = useState('');
  const [modalImgAlt, setModalImgAlt] = useState('');

  useEffect(() => {
    if (searchQuery === '') {
      return;
    }

    setStatus(Status.PENDING);
    fetchImg(searchQuery, page, PER_PAGE)
      .then(({ hits, totalHits }) => {
        if (hits.length === 0) {
          return Promise.reject(new Error('Oops! Nothing found'));
        }

        setImages(state => [...state, ...hits]);
        setTotalHits(totalHits);
        setStatus(Status.RESOLVED);
      })
      .catch(error => {
        setError(error);
        setStatus(Status.REJECTED);
      });
  }, [searchQuery, page]);

  const handleSearchFormSubmit = newQuery => {
    if (searchQuery === newQuery) {
      toast.info('Please, enter new search query.');
      return;
    }

    setImages([]);
    setPage(1);
    setSearchQuery(newQuery);
  };

  const toggleModal = () => {
    setShowModal(state => !state);
  };

  const handleImgClick = ({ largeImageURL: url, tags: alt }) => {
    setModalImgUrl(url);
    setModalImgAlt(alt);
    toggleModal();
  };

  const totalPages = Math.ceil(totalHits / PER_PAGE);

  return (
    <>
      <Searchbar onSubmit={handleSearchFormSubmit} />
      {status === 'idle' && <></>}
      {status === 'pending' && <Loader />}
      {status === 'rejected' && <ErrorSearch message={error.message} />}

      {images.length > 0 && (
        <ImageGallery images={images} openModal={handleImgClick} />
      )}

      {showModal && (
        <Modal onClose={toggleModal} url={modalImgUrl} alt={modalImgAlt} />
      )}

      {status === 'resolved' && totalPages !== page && (
        <LoadMoreBtn handleLoadMore={() => setPage(state => state + 1)} />
      )}

      <ToastContainer />
    </>
  );
};

export default App;
