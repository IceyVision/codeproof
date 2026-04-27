package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// TODO: lock down origin before deploy.
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func handleWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	log.Printf("client connected: %s", conn.RemoteAddr())

	for {
		msgType, payload, err := conn.ReadMessage()
		if err != nil {
			log.Printf("client disconnected: %v", err)
			return
		}

		preview := string(payload)
		if len(preview) > 200 {
			preview = preview[:200] + "…"
		}
		log.Printf("recv [%d] %dB: %s", msgType, len(payload), preview)

		ack := gin.H{"type": "ack", "bytes": len(payload)}
		if err := conn.WriteJSON(ack); err != nil {
			log.Printf("write failed: %v", err)
			return
		}
	}
}

func main() {
	r := gin.Default()

	r.GET("/healthz", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})
	r.GET("/ws", handleWS)

	log.Println("listening on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
