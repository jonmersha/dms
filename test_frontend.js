const payload = {
  username: 'test',
  email: 'test@test.com',
  first_name: 'first',
  last_name: 'last',
  groups: [1],
  department: null
};

let password = 'newpassword123';
if (password) {
  payload.password = password;
}

console.log(payload);
