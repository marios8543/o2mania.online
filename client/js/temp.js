        <div class="songTable grid grid-flow-row auto-rows-max">
          <div class="header w-">
            <span class="text-2xl allVisibleText w-2/4"><button>Title</button></span>
            <span class="text-2xl allVisibleText w-1/4"><button>Level</button></span>
            <span class="text-2xl allVisibleText w-1/4"><button>Duration</button></span>
          </div>
          <div>
            <div v-for="song in songList.filter(item => item.genre == currentGenre)"
              class="content grid grid-flow-col auto-cols-max">
              <span class="allVisibleText truncate">{{ song.title }}</span>
              <span class="allVisibleText truncate">18</span>
              <span class="allVisibleText truncate">{{ song.times[0] }}</span>
            </div>
          </div>
        </div>