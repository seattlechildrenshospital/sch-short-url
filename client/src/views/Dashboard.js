import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addLink,
  updateLink,
  removeLink,
  hydrateLinks,
  drainLinks,
  selectLinks,
} from '../reducers/appSlice';
import axios from 'axios';

function Dashboard() {
  const apiUrl = process.env.REACT_APP_API_ROOT;
  const [modalIsActive, setModalIsActive] = useState(false);
  const [model, setModel] = useState({
    id: '',
    url: '',
  });
  const [currentLink, setCurrentLink] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalTypeCreate, setModalTypeCreate] = useState(true);
  const links = useSelector(selectLinks);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchData();
  }, []);

  function toggleModal(type, link = null, ind = 0) {
    let newModel = {
      id: '',
      url: '',
    };
    setModalTypeCreate(type === 'create');
    setModalIsActive((modalIsActive) => !modalIsActive);

    if (type === 'edit') {
      setCurrentLink(link);
      setCurrentIndex(ind);
      newModel.id = link.id;
      newModel.url = link.url;
    }
    setModel(newModel);
  }

  function fetchData() {
    axios
      .get(`${apiUrl}/app`, {
        headers: {
          Authorization: window.localStorage.getItem('cognitoIdentityToken'),
        },
      })
      .then((response) => dispatch(hydrateLinks(response.data)))
      .catch(() => dispatch(drainLinks()));
  }

  function createLink() {
    axios
      .post(`${apiUrl}/app`, model, {
        headers: {
          Authorization: window.localStorage.getItem('cognitoIdentityToken'),
        },
      })
      .then((response) => {
        if (response.data.error) {
          alert(response.data.message);
        } else {
          toggleModal();
          dispatch(addLink(response.data));
        }
      })
      .catch((err) => {
        // eslint-disable-next-line
        console.log(`POST to ${apiUrl}/app caught error ${err}`);
        alert('Link cannot be created. Bad format.');
      });
  }

  function _updateLink() {
    setCurrentLink((prevLink) => ({ ...prevLink, url: model.url }));
    let tempLink = { ...currentLink, url: model.url };
    axios
      .put(`${apiUrl}/app/${tempLink.id}`, tempLink, {
        headers: {
          Authorization: window.localStorage.getItem('cognitoIdentityToken'),
        },
      })
      .then((response) => {
        if (response.status === 200) {
          toggleModal();
          dispatch(updateLink(response.data, currentIndex));
        } else {
          alert('There was an issue updating your link.');
        }
      })
      .catch((err) => {
        alert('There was an issue updating your link. ' + err);
      });
  }

  function deleteLink(id, ind) {
    if (window.confirm(`Are you sure you want to delete '${id}'`)) {
      axios
        .delete(`${apiUrl}/app/${id}`, {
          headers: {
            Authorization: window.localStorage.getItem('cognitoIdentityToken'),
          },
        })
        .then((response) => {
          if (response.status === 200) {
            dispatch(removeLink(ind));
          } else {
            alert('There was an issue deleting your link.');
          }
        })
        .catch((err) => {
          alert(err);
        });
    }
  }

  return (
    <div className="dashboard">
      <div className="columns is-mobile">
        <div className="column">
          <h1 className="title">Shortcuts</h1>
        </div>
        <div className="column is-2-desktop is-half-mobile">
          <button
            className="button is-info is-outlined is-fullwidth"
            onClick={() => toggleModal('create')}
          >
            New Shortcut
          </button>
        </div>
      </div>

      <div className="columns is-multiline">
        {links.map((link, i) => (
          <div className="column is one-third" key={link.id}>
            <div className="card">
              <header className="card-header has-background-info">
                <p className="card-header-title has-text-white">{link.id}</p>
                {/* <button className="card-header-icon" aria-label="more options">
                  <span className="icon">
                    <i className="fas fa-angle-down" aria-hidden="true"></i>
                  </span>
                </button> */}
              </header>
              <div className="card-content">
                <div className="content">
                  <div className="text-clip" title={link.url}>
                    {link.url}
                  </div>
                  <div className="is-size-7">
                    <time>{link.timestamp}</time>
                  </div>
                </div>
              </div>
              <footer className="card-footer">
                <button onClick={() => toggleModal('edit', link, i)} className="card-footer-item">
                  Edit
                </button>
                <button onClick={() => deleteLink(link.id, i)} className="card-footer-item">
                  Delete
                </button>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${apiUrl}/${link.id}`}
                  className="card-footer-item"
                >
                  Try it
                </a>
              </footer>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <div className={`${modalIsActive ? 'is-active' : ''} modal`}>
        <div className="modal-background"></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">
              {modalTypeCreate ? <span>Create</span> : <span>Update</span>} Link
            </p>
            <button className="delete" onClick={() => toggleModal()} aria-label="close"></button>
          </header>
          <section className="modal-card-body">
            <div className="field">
              <div className="control">
                <input
                  className="input"
                  value={model.id}
                  onChange={(e) => setModel({ ...model, id: e.target.value })}
                  type="text"
                  placeholder="Short Link"
                  required
                  disabled={!modalTypeCreate}
                />
              </div>
            </div>
            <div className="field">
              <div className="control">
                <input
                  className="input"
                  value={model.url}
                  onChange={(e) => setModel({ ...model, url: e.target.value })}
                  type="text"
                  placeholder="Url (Ex: http://mylink.com)"
                  required
                />
              </div>
            </div>
            {!modalTypeCreate && (
              <p className="is-italic has-text-info is-size-7">
                Note: Updates take a minimum of 5 minutes to propagate. You may also need to clear
                your local cache.
              </p>
            )}
          </section>
          <footer className="modal-card-foot">
            {modalTypeCreate ? (
              <button onClick={createLink} className="button is-success">
                Create
              </button>
            ) : (
              <button onClick={_updateLink} className="button is-success">
                Update
              </button>
            )}
            <button className="button" onClick={toggleModal}>
              Cancel
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
