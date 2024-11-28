import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser } from "../../redux/actions/authActions";
import classnames from "classnames";
import "./Login.css";

class Login extends Component {
    constructor() {
        super();
        this.state = {
            email: "",
            password: "",
            errors: {},
            showPassword: false
        };
    }

    componentDidMount() {
        // Redirect if already authenticated
        if (this.props.auth.isAuthenticated) {
            this.redirectBasedOnRole(this.props.auth.user);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.auth.isAuthenticated && !prevProps.auth.isAuthenticated) {
            this.redirectBasedOnRole(this.props.auth.user);
        }

        if (this.props.errors !== prevProps.errors) {
            this.setState({
                errors: this.props.errors
            });
        }
    }

    redirectBasedOnRole = (user) => {
        if (user.isAdmin) {
            this.props.history.push("/admin");
        } else {
            this.props.history.push("/dashboard");
        }
    };

    onChange = e => {
        this.setState({ [e.target.id]: e.target.value });
    };

    togglePasswordVisibility = () => {
        this.setState(prevState => ({
            showPassword: !prevState.showPassword
        }));
    };

    onSubmit = e => {
        e.preventDefault();

        const userData = {
            email: this.state.email,
            password: this.state.password
        };

        console.log("Submitting login with:", userData); // Debug log
        this.props.loginUser(userData, this.props.history);
    };

    render() {
        const { errors, showPassword } = this.state;

        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1>Welcome Back</h1>
                        <p>Enter your credentials to continue</p>
                    </div>
                    <form noValidate onSubmit={this.onSubmit}>
                        <div className="form-group">
                            <input
                                onChange={this.onChange}
                                value={this.state.email}
                                error={errors.email}
                                id="email"
                                type="email"
                                className={classnames("form-control", {
                                    invalid: errors.email || errors.emailnotfound
                                })}
                                placeholder=" "
                            />
                            <label htmlFor="email" className="form-label">Email</label>
                            {(errors.email || errors.emailnotfound) && (
                                <span className="error-message">
                                    {errors.email || errors.emailnotfound}
                                </span>
                            )}
                        </div>
                        <div className="form-group password-field">
                            <input
                                onChange={this.onChange}
                                value={this.state.password}
                                error={errors.password}
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className={classnames("form-control", {
                                    invalid: errors.password || errors.passwordincorrect
                                })}
                                placeholder=" "
                            />
                            <label htmlFor="password" className="form-label">Password</label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={this.togglePasswordVisibility}
                            >
                                <i className="material-icons">
                                    {showPassword ? "visibility_off" : "visibility"}
                                </i>
                            </button>
                            {(errors.password || errors.passwordincorrect) && (
                                <span className="error-message">
                                    {errors.password || errors.passwordincorrect}
                                </span>
                            )}
                        </div>
                        <button type="submit" className="btn-login">
                            Login
                        </button>
                    </form>
                    <div className="login-footer">
                        Don't have an account? <Link to="/register">Sign up</Link>
                    </div>
                    <div className="login-footer">
                        <Link to="/" style={{ color: "#7f8c8d" }}>
                            <i className="material-icons" style={{ verticalAlign: "middle", fontSize: "20px" }}>arrow_back</i>
                            Back to home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

Login.propTypes = {
    loginUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { loginUser }
)(Login);
