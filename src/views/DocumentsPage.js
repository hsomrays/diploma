import React, { Component } from 'react';
import AuthContext from '../context/AuthContext';
import { uploadDocumentToServer, getUserDocuments, deleteDocumentFromServer, downloadDocument } from '../services/DocumentServices';

class DocumentsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedType: null,
      selectedFile: null,
      searchQuery: '',
      userDocuments: null
    };
  }

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchUserDocuments();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.context.authTokens !== prevProps.authTokens) {
      this.fetchUserDocuments();
    }
  }

  fetchUserDocuments = async () => {
    const { authTokens } = this.context;
    if (authTokens) {
      try {
        const documents = await getUserDocuments(authTokens);
        this.setState({ userDocuments: documents });
      } catch (error) {
        console.error('Ошибка при загрузке списка документов:', error);
      }
    }
  };

  handleFileChange = (event) => {
    this.setState({ selectedFile: event.target.files[0] });
  };

  handleUpload = async () => {
    const { selectedFile, selectedType } = this.state;
    const { authTokens } = this.context;

    if (!selectedFile) {
      console.error('No file selected for upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', selectedType);

      const responseData = await uploadDocumentToServer(formData, authTokens);

      console.log('File uploaded successfully:', responseData);

      this.fetchUserDocuments();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  getConvertedType = (selectedType) => {
    switch (selectedType) {
      case 'Чеки':
        return 'check';
      case 'Сертификаты':
        return 'certificate';
      case 'Контракты':
        return 'contract';
      default:
        return '';
    }
  };

  renderDocumentsList = () => {
    const { userDocuments, selectedType, searchQuery } = this.state;

    if (!selectedType) {
      return <p>Выберите тип документов из списка слева</p>;
    }

    const convertedType = this.getConvertedType(selectedType);

    let filteredDocuments = userDocuments.filter(document => document.classification === convertedType);

    if (searchQuery) {
      filteredDocuments = filteredDocuments.filter(document =>
        document.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filteredDocuments.length === 0) {
      return <p>Нет документов для отображения</p>;
    }

    return (
      <ul className="list-group">
        {filteredDocuments.map((document, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{document.name}</span>
            <div>
              <button className="btn btn-primary mr-2" onClick={() => this.handleDownload(document)}>Скачать</button>
              <button className="btn btn-danger" onClick={() => this.handleDelete(document)}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  handleDownload = async (document) => {
    const { authTokens } = this.context;
    await downloadDocument(document.id, document.name, authTokens);
  };

  handleDelete = async (document) => {
    const { authTokens } = this.context;
    try {
      await deleteDocumentFromServer(document.id, authTokens);
      console.log('Документ успешно удален:', document);
      this.fetchUserDocuments();
    } catch (error) {
      console.error('Ошибка при удалении документа:', error);
    }
  };

  handleSearchChange = (event) => {
    this.setState({ searchQuery: event.target.value });
  };

  render() {
    const { selectedType, searchQuery } = this.state;

    return (
      <div style={{ marginTop: '100px' }}>
        <div className="container mt-5">
          <div className="row">
            <div className="col-md-3">
              <div className="card mb-4">
                <div className="card-header">Загрузить файл</div>
                <div className="card-body">
                  <input type="file" onChange={this.handleFileChange} />
                  <button className="btn btn-primary mt-2" onClick={this.handleUpload}>Загрузить</button>
                </div>
              </div>
              <div className="card">
                <div className="card-header">Типы документов</div>
                <div className="card-body">
                  <div className="list-group">
                    <a href="#" className={`list-group-item list-group-item-action ${selectedType === 'Чеки' ? 'active' : ''}`} onClick={() => this.setState({ selectedType: 'Чеки' })}>Чеки</a>
                    <a href="#" className={`list-group-item list-group-item-action ${selectedType === 'Сертификаты' ? 'active' : ''}`} onClick={() => this.setState({ selectedType: 'Сертификаты' })}>Сертификаты</a>
                    <a href="#" className={`list-group-item list-group-item-action ${selectedType === 'Контракты' ? 'active' : ''}`} onClick={() => this.setState({ selectedType: 'Контракты' })}>Контракты</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-9">
              <div className="card">
                <div className="card-header">Документы</div>
                <div className="card-body">
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Поиск документов..."
                    value={searchQuery}
                    onChange={this.handleSearchChange}
                  />
                  {this.renderDocumentsList()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DocumentsPage;
