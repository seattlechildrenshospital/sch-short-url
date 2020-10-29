import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hydrateLinks, drainLinks } from '../reducers/appSlice';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import axios from 'axios';

function Dashboard() {
  const apiUrl = process.env.REACT_APP_API_ROOT;
  const [shortUrl, setShortUrl] = useState('');
  const [httpStatus, setHttpStatus] = useState('');
  const [modalIsActive, setModalIsActive] = useState(false);
  const [model, setModel] = useState({
    id: '',
    url: '',
  });
  const [currentLink, setCurrentLink] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalTypeCreate, setModalTypeCreate] = useState(true);
  const dispatch = useDispatch();

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

  function submitEntry() {
    axios
      .post(
        `${apiUrl}/admin_shrink_url`,
        {
          url_long: model.url,
          cdn_prefix: 'bit-beta.ehealthapplications.com',
        },
        {
          headers: {
            Authorization: window.localStorage.getItem('cognitoIdentityToken'),
          },
        }
      )
      .then((response) => {
        setShortUrl(response.data.url_short);
        setHttpStatus(response.status);
      })
      .catch(() => {
        // eslint-disable-next-line
      //console.log(JSON.stringify(err));
        alert(
          "Short URL can't be created. Bad URL format or the session has timed out. Please refresh and try again."
        );
        setShortUrl('');
        setHttpStatus(400);
      });
  }

  function onCopy(e) {
    alert('You just copied: ' + e.text);
  }

  function onError(e) {
    alert('Failed to copy texts ' + e.text);
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

  const onEnterHandler = (e) => {
    if (e.key === 'Enter') {
      submitEntry();
    }
  };

  const onChangeHandler = (e) => {
    let val = e.target.value;

    setModel((prevModel) => ({ ...prevModel, url: val }));
  };

  return (
    <div className="dashboard">
      <div className="is-mobile">
        <br />
        <div className="field">
          {httpStatus === 200 && (
            <div>
              <div className="alert alert-success">
                <div>
                  Successfully shortened: <br />
                </div>
                <div>{shortUrl}</div>
              </div>
            </div>
          )}
          <div className="control" style={{ marginBottom: '20px' }}>
            <input
              className="input"
              type="text"
              value={model.url}
              onKeyUp={onEnterHandler}
              onChange={onChangeHandler}
              placeholder="Paste Long Url (Ex: https://mylink.com)"
              required
            />
          </div>
          <div>
            <div style={{ display: 'inline-block' }}>
              <button
                type="submit"
                className="btn btn-success"
                style={{ marginRight: '10px' }}
                id="url_input_submit"
                onClick={submitEntry}
              >
                Shorten
              </button>
            </div>
            {httpStatus === 200 && (
              <div style={{ display: 'inline-block' }}>
                <CopyToClipboard text={shortUrl} onCopy={onCopy}>
                  <button type="button" className="btn btn-success">
                    Copy
                  </button>
                </CopyToClipboard>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
