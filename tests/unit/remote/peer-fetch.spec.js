import { PeerFetch } from '@/remote/peer-fetch'
import fetchMock from 'jest-fetch-mock'

describe('PeerFetch class coverage - p2p communication layer', () => {
// global

  beforeAll(() => {
    fetchMock.enableMocks()
  })

  // mock peer instance
  let peer

  beforeEach(() => {
    peer = jest.fn()
    peer.id = 'id_6789'
    peer.options = {
      secure: true,
      host: 'a_host',
      port: '567',
      path: '/a_path/',
      key: 'a_key',
      token: 'token_9876'
    }
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.resetAllMocks()
    fetchMock.resetMocks()
    jest.clearAllTimers()
  })

  test('PeerFetch constructor', () => {
    const dataConnection = jest.fn()
    dataConnection.on = jest.fn()
    const peerFetch = new PeerFetch(dataConnection)
    expect(peerFetch._dataConnection).toBe(dataConnection)
    expect(peerFetch._requestMap).toBeEmpty()
    expect(peerFetch._nextAvailableTicket).toEqual(0)
    expect(peerFetch._nextTicketInLine).toEqual(0)
    expect(peerFetch._dataConnection.on).toHaveBeenCalledTimes(3)
    expect(peerFetch._dataConnection.on).toHaveBeenCalledWith(
      'data', expect.anything()
    )
    expect(peerFetch._dataConnection.on).toHaveBeenCalledWith(
      'open', expect.anything()
    )
    expect(peerFetch._dataConnection.on).toHaveBeenCalledWith(
      'close', expect.anything()
    )
    expect(setInterval).toHaveBeenCalledTimes(1)
    expect(setInterval).toHaveBeenCalledWith(expect.anything(), 1000)
  })
})

test('PeerFetch get()', async () => {
  const dataConnection = jest.fn()
  dataConnection.on = jest.fn()
  const mockResponse = jest.fn()
  const peerFetch = new PeerFetch(dataConnection)
  dataConnection.send = jest.fn().mockImplementation((jsonRequest) => {
    const pair = peerFetch._requestMap.get(peerFetch._nextTicketInLine)
    pair.response = mockResponse
    pair.response.receivedAll = true
  })
  jest.useRealTimers()
  const nextResponse = await peerFetch.get({ url: '/testlink', params: { a: 'one', b: 'two' } })
  expect(dataConnection.send).toHaveBeenCalledTimes(1)
  expect(nextResponse).toBe(mockResponse)
})

test('PeerFetch _schedulePing()', async () => {
  const dataConnection = jest.fn()
  dataConnection.on = jest.fn()
  const mockResponse = jest.fn()
  const peerFetch = new PeerFetch(dataConnection)
  var fetchRequest
  var fetchResponse
  dataConnection.send = jest.fn().mockImplementation((jsonRequest) => {
    fetchRequest = jsonRequest
    const pair = peerFetch._requestMap.get(peerFetch._nextTicketInLine)
    pair.response = mockResponse
    fetchResponse = mockResponse
    pair.response.receivedAll = true
  })
  jest.useFakeTimers()
  await peerFetch._schedulePing()
  // check if the ping task was scheduled
  expect(setInterval).toHaveBeenCalledTimes(1)
  expect(setInterval).toHaveBeenCalledWith(expect.anything(), 1000)
  await jest.runOnlyPendingTimers()
  expect(fetchRequest).toEqual('{"url":"ping?","method":"GET"}')
  expect(fetchResponse).toBe(mockResponse)
})

test('PeerFetch _stopPing()', async () => {
  const dataConnection = jest.fn()
  dataConnection.on = jest.fn()
  const peerFetch = new PeerFetch(dataConnection)
  jest.useFakeTimers()
  await peerFetch._schedulePing()
  // check if the ping task was scheduled
  expect(setInterval).toHaveBeenCalledTimes(1)
  expect(setInterval).toHaveBeenCalledWith(expect.anything(), 1000)
  const timer = peerFetch._keepAlive
  await peerFetch._stopPing()
  expect(clearInterval).toHaveBeenCalledTimes(1)
  expect(clearInterval).toHaveBeenCalledWith(timer)
})
