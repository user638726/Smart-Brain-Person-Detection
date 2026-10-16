import { ChangeEvent, Component } from "react";
interface User {
  id: number;
  name: string;
  email: string;
  entries: number;
  joined: string;
}

interface RegisterProps {
  onRouteChange: (route: string) => void;
   loadUser: (data: User) => void;
}
interface RegisterState {
  name: string;
  email: string;
  password: string;
}
class Register extends Component<RegisterProps, RegisterState> {
  constructor(props: RegisterProps){
    super(props);
    this.state={
      email:'',
      password:'',
      name:''
    }
  }
  onNameChange=(event: ChangeEvent<HTMLInputElement>)=>{
    this.setState({name:event.target.value})
  }
  onEmailChange = (event: ChangeEvent<HTMLInputElement>) =>{
    this.setState({email:event.target.value})
  }
  onPasswordChange = (event: ChangeEvent<HTMLInputElement>)=>{
    this.setState({password:event.target.value})
  }
  onSubmitSignIn=()=>{
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/register`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        email:this.state.email,
        password:this.state.password,
        name:this.state.name
      })
    })
    .then(response => response.json())
    .then(user=>{
       if(user.id){
        this.props.loadUser(user)
        this.props.onRouteChange('home');
       }
    })
  }
  render(){
  return(
    <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
      <main className="pa4 black-80">
  <div className="measure">
    <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
      <legend className="f1 fw6 ph0 mh0 tc">Register</legend>
      <div className="mt3">
        <label className="db fw6 lh-copy f6 tc" htmlFor="name">Name</label>
        <input className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="text" name="name"  id="name" onChange={this.onNameChange}/>
      </div>
      <div className="mt3">
        <label className="db fw6 lh-copy f6 tc" htmlFor="email-address">Email</label>
        <input className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="email" name="email-address"  id="email-address" onChange={this.onEmailChange}/>
      </div>
      <div className="mv3">
        <label className="db fw6 lh-copy f6 tc" htmlFor="password">Password</label>
        <input className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="password" name="password"  id="password" onChange={this.onPasswordChange} />
      </div>
    </fieldset>
    <div className="tc">
      <input className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib" type="submit" value="Register" onClick={this.onSubmitSignIn} />
    </div>
  </div>
</main>

    </article>
    
  );
};
}
export default Register;