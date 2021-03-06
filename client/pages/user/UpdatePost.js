import React from 'react'
import PropTypes from 'prop-types'
import { routerShape } from 'found/lib/PropTypes'
import { createFragmentContainer, graphql } from 'react-relay'
import Formsy from 'formsy-react'
import { FormsyText } from 'formsy-material-ui'
import RaisedButton from 'material-ui/RaisedButton'

import ImageInput from '../../components/imageInput/ImageInput'
import UpdatePostMutation from '../../mutation/UpdatePostMutation'

import styles from './CreatePost.css'

class UpdatePostPage extends React.Component {
  static propTypes = {
    router: routerShape.isRequired,
    relay: PropTypes.shape({
      environment: PropTypes.any.isRequired,
    }).isRequired,
    viewer: PropTypes.shape({
      canPublish: PropTypes.bool,
      post: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
      }),
    }).isRequired,
  }

  constructor() {
    super()
    this.state = {
      canSubmit: false,
    }
  }

  enableButton = () => {
    this.setState({
      canSubmit: true,
    })
  }

  disableButton = () => {
    this.setState({
      canSubmit: false,
    })
  }

  updatePost = ({ title, description, image }) => {
    const environment = this.props.relay.environment
    const post = this.props.viewer.post

    UpdatePostMutation.commit({
      environment,
      input: { id: post.id, title, description },
      files: image,
      onCompleted: () => this.props.router.push(`/post/${post.id}`),
      onError: errors => console.error('Updating post Failed', errors[0]),
    })
  }

  render() {
    const viewer = this.props.viewer
    if (!viewer.canPublish) {
      this.props.router.push('/login')
      return <div />
    }

    const post = viewer.post

    return (
      <div className={styles.content}>
        <h2>Update Post</h2>

        <Formsy.Form
          onValid={this.enableButton}
          onInvalid={this.disableButton}
          onSubmit={this.updatePost}
          className={styles.form}
        >

          <FormsyText
            name="title"
            value={post.title}
            floatingLabelText="Title"
            fullWidth
            validations="isWords"
            validationError="Please enter a title"
            required
          />

          <FormsyText
            name="description"
            value={post.description}
            floatingLabelText="Description"
            fullWidth
            validations="isWords"
            validationError="Please enter a description"
            required
          />

          <ImageInput
            label="Select Image"
            name="image"
            style={{ marginTop: 20 }}
            fullWidth
          />

          <RaisedButton
            type="submit"
            label="Save post"
            secondary
            fullWidth
            style={{ marginTop: 20 }}
            disabled={!this.state.canSubmit}
          />

        </Formsy.Form>
      </div>
    )
  }
}

const container = createFragmentContainer(
  UpdatePostPage,
  graphql`
    fragment UpdatePost_viewer on Viewer {
      canPublish
      post (postId: $postId) {
        id
        title
        description
        image
        creator {
          firstName
          lastName
        }
      }
    }
  `,
)

export default container
