import React from 'react';
import 'uikit/dist/css/uikit.min.css';
import 'uikit/dist/js/uikit-icons.min';
// eslint-disable-next-line no-unused-vars
import './App.css';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: '',
            origin: '',
            dest: '',
            bulk: '',
        };
    }

    updateDestination = (url) => {
        this.handleUrlChange(this.state.origin, url.href);
    }

    checkURL(e, callback) {
        let input = e.target;

        try {
            let url = new URL(input.value);
            input.classList.add('uk-form-success');
            callback(url);
        } catch (e) {
            input.classList.add('uk-form-danger');
            input.classList.remove('uk-form-success');
        }
    }

    handleUrlChange = (url, dest = '') => {
        if (dest === '') {
            dest = this.state.dest;
        }
        this.setState({origin: url, dest: dest});
        const search = url.search;
        let redirect = 'location ~* ' + url.pathname + '$ { \n';
        if (search.length !== 0) {
            redirect = this.handleParameters(search, redirect, dest);
        } else {
            redirect += 'return 301 ' + dest + ';\r\n';
        }
        redirect += '}';
        this.setState({
            redirect: redirect
        })
    };

    handleParameters(search, redirect, dest) {
        if (search.length === 0) {
            return redirect;
        }
        let s = search.replace('?', "").split("&")

        redirect += "  set $validator n;\r\n";
        let validator = 'n';

        for (let i = 0; i < s.length; i++) {
            let parts = s[i].split("=");
            validator += '+1';
            redirect += "  if ($arg_" + parts[0] + " = \"" + parts[1].replace(new RegExp('%20', 'g'), ' ') + "\") {\r\n";
            // eslint-disable-next-line no-template-curly-in-string
            redirect += '    set $validator "${validator}+1";\r\n';
            redirect += '  }\r\n';
        }

        redirect += '  if ($validator = "' + validator + '") {\r\n';
        redirect += '    return 301 ' + dest + ';\r\n'
        redirect += '  }\r\n';

        return redirect;
    }

    addToList = () => {
        let newRedirect = this.state.redirect;
        let bulkCurrent = this.state.bulk;

        document.querySelector("[name='destination-url']").value = "";
        document.querySelector("[name='origin-url']").value = "";

        const bulk = bulkCurrent + "\r\n" + newRedirect;
        this.setState({
            bulk: bulk
        })
        this.setState({
            redirect: ''
        })
    }

    render = () => {
        return (
            <section>
                <div id="sidebar" uk-offcanvas="mode: reveal; overlay: true">
                    <div className="uk-offcanvas-bar">
                        <button type="button" uk-close="" className="uk-icon uk-align-right uk-close"></button>
                        <textarea className="uk-textarea" rows="30" id="redirect-bulk-output" disabled
                                  data-role="none" defaultValue={this.state.bulk}/>
                    </div>
                </div>

                <form className="uk-form-width-large uk-align-center">
                    <div className="uk-margin">
                        <label className="uk-form-label" htmlFor="origin-url">
                            Origin
                        </label>
                        <div className="uk-form-controls">
                            <input
                                type="url"
                                className="uk-input"
                                name="origin-url"
                                onChange={(e) => this.checkURL(e, this.handleUrlChange)}
                                required
                            />
                        </div>
                    </div>
                    <div className="uk-margin">
                        <label className="uk-form-label" htmlFor="destination-url">
                            Destination
                        </label>
                        <div className="uk-form-controls">
                            <input
                                type="url"
                                className="uk-input"
                                name="destination-url"
                                onChange={(e) => this.checkURL(e, this.updateDestination)}
                                required
                            />
                        </div>
                    </div>
                    <div className="uk-margin uk-form-blank">
                        <label className="uk-form-label" htmlFor="destination-url">
                            Redirect
                        </label>
                        <div className="uk-form-controls">
                        <textarea className="uk-textarea" rows="10" id="redirect-output" disabled data-role="none"
                                  defaultValue={this.state.redirect}/>
                        </div>
                    </div>
                </form>
                <div className='uk-form-width-large uk-align-center'>
                    <button className="uk-button uk-align-right uk-button-primary" onClick={this.addToList}>Add to list
                    </button>
                    <button className="uk-button uk-button-default uk-margin-small-right"
                            uk-toggle="target: #sidebar">Reveal all
                    </button>
                </div>
            </section>
        );
    };
}
// export default App;
