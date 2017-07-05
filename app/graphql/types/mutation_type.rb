Types::MutationType = GraphQL::ObjectType.define do
  name "Mutation"
  field :register, field: Mutations::RegisterMutation.field
  field :login,    field: Mutations::LoginMutation.field
  field :logout,   field: Mutations::LogoutMutation.field
  #field :createPost, field: Mutations::CreatePostMutation.field
end