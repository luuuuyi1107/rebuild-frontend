class HashCombine {
  constructor(code, length, mapping, abandon = []) {
    this.code = code
    this.length = length
    this.mapping = mapping
    this.abandon = abandon
  }

  get codes() {
    return this.code.split("").map((name, index) => {
      const value = (this.mapping[name] !== undefined ? this.mapping[name] : name) + ""
      return {
        name,
        index,
        value,
        isLetter: value != name,
        isNumeric: !isNaN(+name),
      }
    })
  }

  get letters() {
    return this.codes.filter((x) => x.isLetter)
  }

  get numeric() {
    return this.codes.filter((x) => x.isNumeric)
  }

  get answers() {
    if (this._answers) return this._answers
    const letterIndexSet = new Set()
    const numberIndexSet = new Set()
    const value = new Set()
    const names = new Set()

    let i = 0
    while (value.size < this.length) {
      const letter = this.letters[i]
      const number = this.numeric[i]
      if (this.abandon.includes(letter.name + number.name)) {
        i++
        continue
      }
      value.add(letter.value + number.value)
      if (value.size != names.size) {
        names.add(letter.name + number.name)
        letterIndexSet.add(letter.index)
        numberIndexSet.add(number.index)
      }
      i++
    }
    const letterIndexArray = [...letterIndexSet]
    const numberIndexArray = [...numberIndexSet]
    this._answers = {
      codes: this.codes.map((x, index) => {
        const letterIndex = letterIndexArray.indexOf(index)
        const numberIndex = numberIndexArray.indexOf(index)
        const pickedIndex = letterIndex > -1 ? letterIndex : numberIndex > -1 ? numberIndex : -1
        return {
          ...x,
          isPicked: letterIndexSet.has(index) || numberIndexSet.has(index),
          pickedIndex,
        }
      }),
      value: [...value],
      names: [...names],
    }
    return this._answers
  }

  getCodes() {
    return this.answers.codes
  }

  getAnswers() {
    return this.answers.value
  }

  getNames() {
    return this.answers.names
  }
}

class HashPick {
  constructor(code, length, take, options) {
    const { mapping = {}, canRepeat = false, reverse = false, valueLength = 1 } = options
    this.code = code
    this.length = length
    this.take = take
    this.mapping = mapping
    this.canRepeat = canRepeat
    this.reverse = reverse
    this.valueLength = valueLength
  }

  get codes() {
    return this.code.split("").map((name, index) => {
      const value = (this.mapping[name] !== undefined ? this.mapping[name] : name) + ""
      return { name, index, value }
    })
  }

  get answers() {
    const pickedIndex = new Set()
    const value = []
    const codes = this.reverse ? this.codes.reverse() : this.codes
    for (const code of codes) {
      if (this.take.test(code.name)) {
        const finalValue = code.value.padStart(this.valueLength, "0")
        if (!this.canRepeat && value.includes(finalValue)) {
          continue
        }

        value.push(finalValue)
        pickedIndex.add(code.index)
      }
      if (value.length >= this.length) {
        break
      }
    }

    return {
      codes: this.codes.map((x, index) => ({ ...x, isPicked: pickedIndex.has(index) })),
      value,
    }
  }

  getCodes() {
    return this.answers.codes
  }

  getAnswers() {
    return this.answers.value
  }

  getNames() {
    return []
  }
}

export class HashFactory {
  static make(lotteryId, code) {
    switch (+lotteryId) {
      case 73: // 哈希一分⑥合彩
        return new HashCombine(code, 7, { a: 0, b: 1, c: 2, d: 3, e: 4 }, ["a0"])
      case 74: // 哈希一分11选5
        return new HashPick(code, 5, /[0-9a]/, { mapping: { a: 11, 0: 10 }, valueLength: 2 })
      case 167: // 哈希半分快三
      case 168: // 哈希一分快三
      case 169: // 哈希幸运快三
        return new HashPick(code, 3, /[1-6]/, { canRepeat: true })
      case 70: // 哈希半分PK拾
      case 71: // 哈希一分PK拾
      case 72: // 哈希幸运10
        return new HashPick(code, 10, /\d/, { mapping: { 0: 10 } })
      case 65: // 哈希半分彩
      case 66: // 哈希一分彩
      case 67: // 哈希幸运5
        return new HashPick(code, 5, /\d/, { canRepeat: true, reverse: true })

      default:
        // throw new Error("lottery id not found")
        return {}
    }
  }
}
