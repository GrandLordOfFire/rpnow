package main

import (
	"encoding/json"
	"fmt"
	"io"
	"regexp"
	"strings"
	"time"

	"github.com/mitchellh/go-wordwrap"
)

type RoomInfo struct {
	Title    string `json:"title"`
	ReadCode string `json:"readCode"`
}

// SlugInfo describes what URL corresponds to what RP
type SlugInfo struct {
	Rpid   string `json:"rpid"`
	Access string `json:"access"`
}

type Doc interface {
	Meta() *DocMeta
	ParseBody(io.Reader) error
	Validate() error
	CheckRelations(rpid string, db *database) error
}

type DocMeta struct {
	ID        string    `json:"_id"`
	Revision  int       `json:"revision"`
	Timestamp time.Time `json:"timestamp"`
	Userid    string    `json:"userid"`
}

type RpMessageBody struct {
	Type    string `json:"type"`
	Content string `json:"content,omitempty"`
	URL     string `json:"url,omitempty"`
	CharaID string `json:"charaId,omitempty"`
}
type RpMessage struct {
	*RpMessageBody
	*DocMeta
}

func NewRpMessage() RpMessage {
	return RpMessage{&RpMessageBody{}, &DocMeta{}}
}

func (x RpMessage) ParseBody(j io.Reader) error {
	return json.NewDecoder(j).Decode(x.RpMessageBody)
}

func (x RpMessage) Meta() *DocMeta {
	return x.DocMeta
}

type RpCharaBody struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}
type RpChara struct {
	*RpCharaBody
	*DocMeta
}

func NewRpChara() RpChara {
	return RpChara{&RpCharaBody{}, &DocMeta{}}
}

func (x RpChara) ParseBody(j io.Reader) error {
	return json.NewDecoder(j).Decode(x.RpCharaBody)
}

func (x RpChara) Meta() *DocMeta {
	return x.DocMeta
}

func (m RpMessageBody) Validate() error {
	if m.Type == "image" {
		if m.Content != "" {
			return fmt.Errorf("Msg: image should not have 'content'")
		}
		if m.CharaID != "" {
			return fmt.Errorf("Msg: image should not have 'charaId'")
		}
		if len(m.URL) > 1000 {
			return fmt.Errorf("Msg: url is too long (%d characters)", len(m.Content))
		}
		urlRegexp := regexp.MustCompile("^https?://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+$")
		if !urlRegexp.MatchString(m.URL) {
			return fmt.Errorf("Msg: url is invalid")
		}
		return nil
	} else if m.Type == "narrator" || m.Type == "chara" || m.Type == "ooc" {
		if m.URL != "" {
			return fmt.Errorf("Msg: non-image should not have 'url'")
		}
		if m.Content == "" {
			return fmt.Errorf("Msg: content is empty")
		}
		if len(m.Content) > 50000 {
			return fmt.Errorf("Msg: content is too long (%d characters)", len(m.Content))
		}
		if m.Type == "chara" {
			if m.CharaID == "" {
				return fmt.Errorf("Msg: charaId is empty")
			}
		} else {
			if m.CharaID != "" {
				return fmt.Errorf("Msg: non-chara msg should not have 'charaId'")
			}
		}
		return nil
	} else {
		return fmt.Errorf("Msg: invalid type")
	}
}

func (m RpMessageBody) CheckRelations(rpid string, db *database) error {
	if m.Type == "chara" {
		if db.getChara(rpid, m.CharaID) == nil {
			return fmt.Errorf("Msg with invalid chara id: %s", m.CharaID)
		}
	}
	return nil
}

func (c RpCharaBody) Validate() error {
	if len(c.Name) == 0 {
		return fmt.Errorf("Chara: name is empty")
	}
	if len(c.Name) > 30 {
		return fmt.Errorf("Chara: name is too long")
	}
	colorRegexp := regexp.MustCompile("^#[0-9a-f]{6}$")
	if !colorRegexp.MatchString(c.Color) {
		return fmt.Errorf("Chara: color is invalid")
	}
	return nil
}

func (c RpCharaBody) CheckRelations(rpid string, db *database) error {
	return nil
}

func (m RpMessage) ToTxt(chara *RpChara) string {
	switch m.Type {
	case "chara":
		return strings.ToUpper(chara.Name) + ":\r\n  " + strings.Replace(wordwrap.WrapString(m.Content, 70), "\n", "\r\n  ", 0)
	case "ooc":
		return strings.Replace(wordwrap.WrapString("(( OOC: "+m.Content+" ))", 72), "\n", "\r\n", 0)
	case "narrator":
		return strings.Replace(wordwrap.WrapString(m.Content, 72), "\n", "\r\n", 0)
	case "image":
		return "--- IMAGE ---\r\n" + m.URL + "\r\n-------------"
	default:
		panic("What kind of message is this?")
	}
}

type chatStreamMessage struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

type exportFirstBlock struct {
	Title  string        `json:"title"`
	Charas []exportChara `json:"charas"`
}
type exportChara struct {
	Timestamp time.Time `json:"timestamp"`
	*RpCharaBody
}
type exportMessage struct {
	Timestamp time.Time `json:"timestamp"`
	*RpMessageBody
	CharaID *int `json:"charaId,omitempty"`
}