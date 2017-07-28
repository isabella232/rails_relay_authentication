require 'rails_helper'

RSpec.describe "Mutations::CreatePasswordResetMutation", type: "request" do
  let(:endpoint) { "/graphql" }
  let(:json) { JSON.parse(response.body)["data"] }
  let(:password) { "foobarbaz" }
  let!(:user) { create(:user, password: password) }

  describe "CreatePasswordResetMutation" do
    let(:query) {
      <<-GRAPHQL
        mutation CreatePasswordResetMutation($input: CreatePasswordResetInput!){
          createPasswordReset(input: $input) {
            user {
              id
            }
          }
        }
      GRAPHQL
    }

    let(:variables) {{
      "input" => {
        "email" => user.email
      }      
    }}

    context "Not logged in" do
      it "creates a password reset record in the database" do
        post(endpoint, params: { query: query, variables: variables })

        expect(json["createPasswordReset"]["user"]).to be_nil

        password_reset = Database.password_resets.first
        expect(password_reset.user_id).to eq(user.id)
        expect(password_reset.token).to be_a(String)
        expect(password_reset.token.length).to eq(24)
      end

      describe "errors" do
        let(:errors) { JSON.parse(response.body)["errors"] }

        let(:register_user) {
          post(endpoint, params: { query: query, variables: variables })          
        }

        it "requires an email address" do
          variables["input"].merge!("email" => nil)

          expect {
            register_user
          }.not_to change(API::User, :count)

          expect(errors.first["message"]).to eq("Variable input of type CreatePasswordResetInput! was provided invalid value")
        end

        it "requires a valid email address" do
          variables["input"].merge!("email" => "foo")

          expect {
            register_user
          }.not_to change(API::User, :count)
          expect(errors.first["message"]).to eq("Wrong email or password")
        end
      end
    end
  end
end