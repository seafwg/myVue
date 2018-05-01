import className from '../assets/styles/footer.styl'

export default {
  data() {
    return {
      author: 'Jokcy'
    }
  },
  render() {
    return (//jsx语法
      <div id={className.footer}>
        <span>Written by {this.author}</span>
      </div>
    )
  }
}