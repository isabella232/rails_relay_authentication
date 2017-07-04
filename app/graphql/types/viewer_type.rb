Types::ViewerType = GraphQL::ObjectType.define do
  name "Viewer"

  field :isLoggedIn, types.Boolean do
    resolve ->(obj, args, ctx) {
      ctx[:tokenData][:role].in?(User.roles.keys)      
    }
  end

  field :canPublish, types.Boolean do
    resolve ->(obj, args, ctx) {
      ctx[:tokenData][:role].in?(User.roles.keys[0..1])      
    }
  end

  field :user, Types::UserType do
    resolve ->(obj, args, ctx) {
      Database.db.get_user(ctx[:tokenData][:userId])      
    }
  end

  field :post, Types::PostType do
    argument :postId, types.String
    resolve ->(obj, args, ctx) {
      Database.db.get_post(args[:postId])      
    }
  end

  connection :posts, Types::PostType.connection_type do
    argument :first, types.Int
    
    resolve ->(obj, args, ctx) {
      Database.db.get_posts
    }
  end
end
