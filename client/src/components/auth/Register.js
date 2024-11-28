import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../../redux/actions/authActions";
import classnames from "classnames";
import "./Register.css";

class Register extends Component {
    constructor() {
        super();
        this.state = {
            name: "",
            email: "",
            password: "",
            password2: "",
            errors: {},
            showPassword: false,
            showPassword2: false
        };
    }

    componentDidMount() {
        if (this.props.auth.isAuthenticated) {
            this.props.history.push("/dashboard");
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.errors) {
            this.setState({
                errors: nextProps.errors
            });
        }
    }

    onChange = e => {
        this.setState({ [e.target.id]: e.target.value });
    };

    togglePasswordVisibility = (field) => {
        if (field === 'password') {
            this.setState(prevState => ({
                showPassword: !prevState.showPassword
            }));
        } else if (field === 'password2') {
            this.setState(prevState => ({
                showPassword2: !prevState.showPassword2
            }));
        }
    };

    onSubmit = e => {
        e.preventDefault();
        const newUser = {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password,
            password2: this.state.password2
        };
        this.props.registerUser(newUser, this.props.history);
    };

    render() {
        const { errors, showPassword, showPassword2 } = this.state;

        return (
            <div className="register-container">
                <div className="register-card">
                    <div className="register-header">
                        <h1>Create an Account</h1>
                        <p>Join us and start trading today</p>
                    </div>
                    <form noValidate onSubmit={this.onSubmit}>
                        <div className="form-group">
                            <input
                                onChange={this.onChange}
                                value={this.state.name}
                                error={errors.name}
                                id="name"
                                type="text"
                                className={classnames("form-input", {
                                    invalid: errors.name
                                })}
                                placeholder="Name"
                            />
                            {errors.name && (
                                <span className="error-text">{errors.name}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <input
                                onChange={this.onChange}
                                value={this.state.email}
                                error={errors.email}
                                id="email"
                                type="email"
                                className={classnames("form-input", {
                                    invalid: errors.email
                                })}
                                placeholder="Email"
                            />
                            {errors.email && (
                                <span className="error-text">{errors.email}</span>
                            )}
                        </div>
                        <div className="form-group password-field">
                            <input
                                onChange={this.onChange}
                                value={this.state.password}
                                error={errors.password}
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className={classnames("form-input", {
                                    invalid: errors.password
                                })}
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => this.togglePasswordVisibility('password')}
                            >
                                <i className="material-icons">
                                    {showPassword ? "visibility_off" : "visibility"}
                                </i>
                            </button>
                            {errors.password && (
                                <span className="error-text">{errors.password}</span>
                            )}
                        </div>
                        <div className="form-group password-field">
                            <input
                                onChange={this.onChange}
                                value={this.state.password2}
                                error={errors.password2}
                                id="password2"
                                type={showPassword2 ? "text" : "password"}
                                className={classnames("form-input", {
                                    invalid: errors.password2
                                })}
                                placeholder="Confirm Password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => this.togglePasswordVisibility('password2')}
                            >
                                <i className="material-icons">
                                    {showPassword2 ? "visibility_off" : "visibility"}
                                </i>
                            </button>
                            {errors.password2 && (
                                <span className="error-text">{errors.password2}</span>
                            )}
                        </div>
                        <button type="submit" className="register-button">
                            Create Account
                        </button>
                    </form>
                    <div className="register-footer">
                        Already have an account? <Link to="/login">Log in</Link>
                    </div>
                    <div className="register-footer">
                        <Link to="/" className="back-link">
                            <i className="material-icons">arrow_back</i>
                            <span>Back to home</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

Register.propTypes = {
    registerUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { registerUser }
)(withRouter(Register));